const { GObject, St, Clutter, Gio } = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

function onedriveSynchronize(onedriveDirectory) {
    const cd = new Gio.Subprocess(["cd", onedriveDirectory, null], Gio.SubprocessFlags.NONE);

    if (cd === null) {
        return false;
    }

    cd.wait(new Gio.Cancellable());

    if (cd.get_exit_status() !== 0) {
        return false;
    }

    const onedrive = new Gio.Subprocess(["onedrive", "--synchronize", null], Gio.SubprocessFlags.NONE);

    if (onedrive === null) {
        return false;
    }

    onedrive.wait(new Gio.Cancellable());

    if (onedrive.get_exit_status() !== 0) {
        return false;
    }

    return true;
}

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, "OneDrive Indicator");

            this.add_child(
                new St.Label({
                    text: "OneDrive",
                    y_align: Clutter.ActorAlign.CENTER
                })
            );

            const item = new PopupMenu.PopupMenuItem("Synchronize");
            item.connect("activate", () => {
                Main.notify("Working?");

                try {
                    if (!onedriveSynchronize("/home/OneDrive")) {
                        Main.notify("Failed to synchronize");
                    } else {
                        Main.notify("Successfully synchronized");
                    }
                } catch (e) {
                    Main.notify(e.toString());
                }
            });
            this.menu.addMenuItem(item);
        }
    }
);

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
