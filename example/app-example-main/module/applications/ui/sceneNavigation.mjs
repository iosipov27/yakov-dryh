import { emitAsGM, GMUpdateEvent } from '../../systemRegistration/socket.mjs';

export default class DhSceneNavigation extends foundry.applications.ui.SceneNavigation {
    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        classes: ['faded-ui', 'flexcol', 'scene-navigation'],
        actions: {
            openSceneEnvironment: DhSceneNavigation.#openSceneEnvironment
        }
    };

    /** @inheritdoc */
    static PARTS = {
        scenes: {
            root: true,
            template: 'systems/app-example/templates/ui/sceneNavigation/scene-navigation.hbs'
        }
    };

    /** @inheritdoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        const extendScenes = scenes =>
            scenes.map(x => {
                const scene = game.scenes.get(x.id);
                if (!scene.flags["app-example"]) return x;

                const appExampleInfo = new game.system.api.data.scenes.DHScene(scene.flags["app-example"]);
                const environments = appExampleInfo.sceneEnvironments.filter(
                    x => x && x.testUserPermission(game.user, 'LIMITED')
                );
                const hasEnvironments = environments.length > 0 && x.isView;
                return {
                    ...x,
                    hasEnvironments,
                    environmentImage: hasEnvironments ? environments[0].img : null,
                    environments: environments
                };
            });
        context.scenes.active = extendScenes(context.scenes.active);
        context.scenes.inactive = extendScenes(context.scenes.inactive);

        return context;
    }

    static async #openSceneEnvironment(event, button) {
        const scene = game.scenes.get(button.dataset.sceneId);
        const sceneEnvironments = new game.system.api.data.scenes.DHScene(
            scene.flags["app-example"]
        ).sceneEnvironments.filter(x => x.testUserPermission(game.user, 'LIMITED'));

        if (sceneEnvironments.length === 1 || event.shiftKey) {
            sceneEnvironments[0].sheet.render(true);
        } else {
            new foundry.applications.ux.ContextMenu.implementation(
                button,
                '.scene-environment',
                sceneEnvironments.map(environment => ({
                    name: environment.name,
                    callback: () => {
                        if (scene.flags["app-example"].sceneEnvironments[0] !== environment.uuid) {
                            const newEnvironments = scene.flags["app-example"].sceneEnvironments;
                            const newFirst = newEnvironments.splice(
                                newEnvironments.findIndex(x => x === environment.uuid),
                                1
                            )[0];
                            newEnvironments.unshift(newFirst);
                            emitAsGM(
                                GMUpdateEvent.UpdateDocument,
                                scene.update.bind(scene),
                                { 'flags.app-example.sceneEnvironments': newEnvironments },
                                scene.uuid
                            );
                        }

                        environment.sheet.render({ force: true });
                    }
                })),
                {
                    jQuery: false,
                    fixed: true
                }
            );

            CONFIG.ux.ContextMenu.triggerContextMenu(event, '.scene-environment');
        }
    }
}
