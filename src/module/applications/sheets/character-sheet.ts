import { openDryhDiceTrayForActor } from "../../chat/dice-tray-card-service.js";
import {
  addResponseSlot as addResponseSlotData,
  countConfiguredResponses,
  DRYH_EXHAUSTION_MAX,
  DRYH_RESPONSE_MAX,
  createDefaultResponsesData,
  hasCompleteResponseConfiguration,
  hasCheckedResponses,
  normalizeCharacterSystemData,
  type YakovDryhResponseSlotData
} from "../../data/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
import { parseLineList } from "../../utils/index.js";
import { createCharacterSheetContext } from "./character-sheet-context.js";
import { localize } from "./character-sheet-localization.js";
import { getEditablePoolTotal } from "./character-sheet-pool-helpers.js";
import {
  createResponseEditorData,
  normalizeResponseType
} from "./character-sheet-response-helpers.js";
import { normalizeCharacterSheetSubmitData } from "./character-sheet-submit-helpers.js";
import type {
  EditableSheetPoolDrafts,
  EditableSheetPoolField
} from "./character-sheet-types.js";

const BaseSheet: any = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
);

export class YakovDryhCharacterSheet extends BaseSheet {
  private boundRoot: HTMLElement | null = null;
  private readonly handleRootChangeBound = (event: Event): void => {
    this.handleRootChange(event);
  };
  private readonly handleRootClickBound = (event: MouseEvent): void => {
    this.handleRootClick(event);
  };
  private poolEditValues: EditableSheetPoolDrafts = {};
  private responseEditSlots: YakovDryhResponseSlotData[] | null = null;

  static DEFAULT_OPTIONS = {
    classes: ["actor", SYSTEM_ID, "yakov-dryh-sheet"],
    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },
    position: {
      height: "auto" as const,
      width: 780
    },
    tag: "form",
    window: {
      icon: "fa-solid fa-address-card",
      resizable: true,
      title: "Don't Rest Your Head Character Sheet"
    }
  };

  static PARTS = {
    content: {
      root: true,
      template: TEMPLATE_PATHS.characterSheet
    }
  };

  get title(): string {
    const actorName =
      this.actor?.name ?? game.i18n?.localize("DOCUMENT.Actor") ?? "Actor";

    return `${SYSTEM_TITLE}: ${actorName}`;
  }

  protected async _prepareContext(options: any): Promise<any> {
    const context = await super._prepareContext(options);
    Object.assign(
      context,
      createCharacterSheetContext({
        actor: this.actor,
        poolEditValues: this.poolEditValues,
        responseEditSlots: this.responseEditSlots
      })
    );

    return context;
  }

  protected async _onRender(context: any, options: any): Promise<void> {
    await super._onRender(context, options);

    const root = this.element as HTMLElement | null;

    if (!(root instanceof HTMLElement)) {
      return;
    }

    this.bindRootListeners(root);
  }

  protected _prepareSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: any,
    updateData?: unknown
  ): object {
    const submitData = this._processFormData(event, form, formData) as Record<
      string,
      unknown
    >;

    if (updateData) {
      foundry.utils.mergeObject(submitData, updateData, {
        performDeletions: true
      });
      foundry.utils.mergeObject(submitData, updateData, {
        performDeletions: false
      });
    }

    const normalizedSubmit = normalizeCharacterSheetSubmitData({
      currentName: this.actor?.name,
      submitData
    });

    if (normalizedSubmit.shouldWarnEmptyName) {
      ui.notifications?.warn(
        localize(
          "YAKOV_DRYH.UI.Warnings.CharacterNameRequired",
          "Character name cannot be empty."
        )
      );
    }

    this.document.validate({
      changes: normalizedSubmit.submitData,
      clean: true,
      fallback: false
    });

    return normalizedSubmit.submitData;
  }

  private async addActorPoolToTray(): Promise<void> {
    if (!this.actor) {
      return;
    }

    const actorData = normalizeCharacterSystemData(this.actor.system);

    if (!hasCompleteResponseConfiguration(actorData.responses)) {
      ui.notifications?.warn(
        localize(
          "YAKOV_DRYH.UI.Warnings.ResponsesNotConfigured",
          "Configure all 3 Responses before rolling."
        )
      );
      return;
    }

    await openDryhDiceTrayForActor(this.actor);
  }

  private bindRootListeners(root: HTMLElement): void {
    if (this.boundRoot === root) {
      return;
    }

    this.boundRoot?.removeEventListener("click", this.handleRootClickBound);
    this.boundRoot?.removeEventListener("change", this.handleRootChangeBound);
    root.addEventListener("click", this.handleRootClickBound);
    root.addEventListener("change", this.handleRootChangeBound);
    this.boundRoot = root;
  }

  private async safeActorUpdate(
    patch: Record<string, unknown>
  ): Promise<foundry.documents.BaseActor | null> {
    const actor = this.actor;
    if (!actor) return null;

    const validRe = /\.(png|jpe?g|gif|webp|svg)$/i;
    if (!actor.img || !validRe.test(String(actor.img))) {
      try {
        // Ensure actor has a valid img before applying other updates to avoid validation errors
        // Use a neutral placeholder available in Foundry
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await actor.update({ img: "icons/svg/mystery-man.svg" } as Record<
          string,
          unknown
        >);
      } catch (err) {
        // Ignore — we'll still attempt the requested update
        console.warn("Failed to sanitize actor.img before update:", err);
      }
    }

    return actor.update(patch as Record<string, unknown>);
  }

  private handleRootClick(event: MouseEvent): void {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const actionElement = target.closest<HTMLElement>(
      "[data-yakov-dryh-action], [data-yakov-dryh-response-action], [data-yakov-dryh-response-add], [data-yakov-dryh-pool-edit-action], [data-yakov-dryh-pool-action]"
    );

    if (!actionElement) {
      return;
    }

    event.preventDefault();
    // Avatar change handler: open FilePicker and update actor image
    if (actionElement.dataset.yakovDryhAction === "avatar-change") {
      if (!this.actor || !this.actor.isOwner) return;

      const picker = new FilePicker({
        type: "image",
        current: this.actor.img ?? "",
        callback: async (path: string) => {
          try {
            await this.safeActorUpdate({ img: path } as Record<
              string,
              unknown
            >);
          } catch (err) {
            console.error(err);
          }
        }
      });

      picker.render(true);
      return;
    }

    if (actionElement.dataset.yakovDryhAction === "add-pool-to-tray") {
      void this.addActorPoolToTray();
      return;
    }

    if (actionElement.dataset.yakovDryhResponseAdd) {
      void this.addResponseSlot(actionElement.dataset.yakovDryhResponseAdd);
      return;
    }

    switch (actionElement.dataset.yakovDryhResponseAction) {
      case "edit":
        void this.startResponseEdit();
        return;

      case "save":
        void this.saveResponseEdit();
        return;
    }

    const editField = actionElement.dataset.yakovDryhPoolEditField as
      | EditableSheetPoolField
      | undefined;
    const editAction = actionElement.dataset.yakovDryhPoolEditAction as
      | "edit"
      | "save"
      | undefined;

    if (editField && editAction) {
      switch (editAction) {
        case "edit":
          void this.startPoolEdit(editField);
          return;

        case "save":
          void this.savePoolEdit(editField);
          return;
      }
    }

    const field = actionElement.dataset.yakovDryhPoolField as
      | EditableSheetPoolField
      | undefined;
    const action = actionElement.dataset.yakovDryhPoolAction as
      | "decrease"
      | "increase"
      | undefined;

    if (!field || !action) {
      return;
    }

    void this.updatePoolFromAction(field, action);
  }

  private handleRootChange(event: Event): void {
    const target = event.target;

    if (
      target instanceof HTMLInputElement &&
      target.dataset.yakovDryhResponseToggle
    ) {
      void this.updateResponseChecked(
        Number.parseInt(target.dataset.yakovDryhResponseToggle, 10),
        target.checked
      );
      return;
    }

    if (
      target instanceof HTMLTextAreaElement &&
      target.dataset.yakovDryhField === "scars"
    ) {
      void this.updateScars(target.value);
    }
  }

  private async updatePoolFromAction(
    field: EditableSheetPoolField,
    action: "decrease" | "increase"
  ): Promise<void> {
    const actor = this.actor;
    const currentValue = this.poolEditValues[field];

    if (!actor || currentValue === undefined) {
      return;
    }

    const maxValue =
      field === "exhaustion"
        ? DRYH_EXHAUSTION_MAX
        : getEditablePoolTotal(currentValue);
    const nextValue =
      action === "increase"
        ? Math.min(currentValue + 1, maxValue)
        : Math.max(currentValue - 1, 0);

    if (nextValue === currentValue) {
      return;
    }

    this.poolEditValues = {
      ...this.poolEditValues,
      [field]: nextValue
    };

    await this.render({ force: true });
  }

  private async startPoolEdit(field: EditableSheetPoolField): Promise<void> {
    const actor = this.actor;

    if (!actor || this.poolEditValues[field] !== undefined) {
      return;
    }

    const actorData = normalizeCharacterSystemData(actor.system);
    this.poolEditValues = {
      ...this.poolEditValues,
      [field]: actorData[field]
    };

    await this.render({ force: true });
  }

  private async savePoolEdit(field: EditableSheetPoolField): Promise<void> {
    const actor = this.actor;
    const nextValue = this.poolEditValues[field];

    if (!actor || nextValue === undefined) {
      return;
    }

    const actorData = normalizeCharacterSystemData(actor.system);
    const currentValue = actorData[field];
    const restoredEditValues = {
      ...this.poolEditValues
    };
    const poolEditValues = {
      ...this.poolEditValues
    };

    delete poolEditValues[field];
    this.poolEditValues = poolEditValues;

    if (nextValue === currentValue) {
      await this.render({ force: true });
      return;
    }

    try {
      await this.safeActorUpdate({ [`system.${field}`]: nextValue } as Record<
        string,
        unknown
      >);
    } catch (error) {
      this.poolEditValues = restoredEditValues;
      throw error;
    }
  }

  private async updateResponseChecked(
    slotIndex: number,
    checked: boolean
  ): Promise<void> {
    const actor = this.actor;

    if (!actor || !Number.isInteger(slotIndex) || slotIndex < 0) {
      return;
    }

    const currentData = normalizeCharacterSystemData(actor.system);
    const currentSlot = currentData.responses.slots[slotIndex];

    if (
      !currentSlot ||
      currentSlot.type === "" ||
      currentSlot.checked === checked
    ) {
      return;
    }

    await this.safeActorUpdate({
      "system.responses.slots": currentData.responses.slots.map(
        (slot, index) =>
          index === slotIndex
            ? {
                ...slot,
                checked
              }
            : slot
      ),
      "system.responses.max": DRYH_RESPONSE_MAX
    } as Record<string, unknown>);
  }

  private async addResponseSlot(value: string): Promise<void> {
    const actor = this.actor;
    const type = normalizeResponseType(value);

    if (!actor || type === "") {
      return;
    }

    const currentResponses = createResponseEditorData(
      this.responseEditSlots,
      normalizeCharacterSystemData(actor.system).responses
    );
    const updatedResponses = addResponseSlotData(currentResponses, type);

    if (!updatedResponses) {
      return;
    }

    if (this.responseEditSlots !== null) {
      this.responseEditSlots = updatedResponses.slots;
      await this.render({ force: true });
      return;
    }

    await this.safeActorUpdate({
      "system.responses.slots": updatedResponses.slots,
      "system.responses.max": DRYH_RESPONSE_MAX
    } as Record<string, unknown>);
  }

  private async startResponseEdit(): Promise<void> {
    const actor = this.actor;

    if (!actor) {
      return;
    }

    const currentResponses = normalizeCharacterSystemData(
      actor.system
    ).responses;

    if (hasCheckedResponses(currentResponses)) {
      const confirmed = await this.confirmResponseEditReset();

      if (!confirmed) {
        return;
      }
    }

    this.responseEditSlots = createDefaultResponsesData().slots;
    await this.render({ force: true });
  }

  private async saveResponseEdit(): Promise<void> {
    const actor = this.actor;

    if (!actor || this.responseEditSlots === null) {
      return;
    }

    const updatedResponses = createResponseEditorData(
      this.responseEditSlots,
      normalizeCharacterSystemData(actor.system).responses
    );

    if (countConfiguredResponses(updatedResponses) !== DRYH_RESPONSE_MAX) {
      return;
    }

    const editSlots = this.responseEditSlots;
    this.responseEditSlots = null;

    try {
      await this.safeActorUpdate({
        "system.responses.slots": updatedResponses.slots,
        "system.responses.max": DRYH_RESPONSE_MAX
      } as Record<string, unknown>);
    } catch (error) {
      this.responseEditSlots = editSlots;
      throw error;
    }
  }

  private async confirmResponseEditReset(): Promise<boolean> {
    const action = await foundry.applications.api.DialogV2.wait({
      buttons: [
        {
          action: "cancel",
          label: localize(
            "YAKOV_DRYH.SHEETS.Actor.Character.Actions.Cancel",
            "Cancel"
          )
        },
        {
          action: "edit",
          default: true,
          label: localize(
            "YAKOV_DRYH.SHEETS.Actor.Character.Actions.EditResponses",
            "Edit Responses"
          )
        }
      ],
      content: [
        `<p>${localize("YAKOV_DRYH.SHEETS.Actor.Character.Prompts.EditResponses", "Edit Responses?")}</p>`,
        `<p>${localize("YAKOV_DRYH.SHEETS.Actor.Character.Prompts.EditResponsesWarning", "This will clear all marks.")}</p>`
      ].join(""),
      classes: [SYSTEM_ID, "yakov-dryh-dialog"],
      modal: true,
      rejectClose: false,
      window: {
        title: localize(
          "YAKOV_DRYH.SHEETS.Actor.Character.Actions.EditResponses",
          "Edit Responses"
        )
      }
    });

    return action === "edit";
  }

  private async updateScars(value: string): Promise<void> {
    if (!this.actor) {
      return;
    }

    await this.safeActorUpdate({
      "system.scars": parseLineList(value)
    } as Record<string, unknown>);
  }
}
