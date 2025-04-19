import { getAliasFileLocation } from "./globalVaribles";

const File = Java.type("java.io.File");

let aliasFile = new File(getAliasFileLocation());
if (!aliasFile.exists()) {
    aliasFile.getParentFile().mkdirs();
    FileLib.write(getAliasFileLocation(), "{}");
}

try {
    let fileContent = FileLib.read(getAliasFileLocation());
    if (fileContent === "") {
        FileLib.write(getAliasFileLocation(), "{}");
    }
    const alias = JSON.parse(fileContent);
    if (alias && Object.keys(alias).length > 0) {
        for (const [aliasName, command] of Object.entries(alias)) {
            register("command", () => {
                ChatLib.command(command);
            }).setName(aliasName)
                .setTabCompletions([aliasName]);
        }
    }
} catch (e) {
    ChatLib.chat(`Failed to load aliases: ${e.message}`);
}

register("command", (...args) => {
    try {
        if (args.length < 2) {
            ChatLib.chat("Usage: /makealias aliasName command [argument1 argument2 ...]");
            return;
        }
        let aliasName = args[0];
        let command = args.slice(1).join(" ");

        let alias = JSON.parse(FileLib.read(getAliasFileLocation()));
        alias[aliasName] = command;
        FileLib.write(getAliasFileLocation(), JSON.stringify(alias, null, 2));
        
        register("command", () => {
            ChatLib.command(command);
        }).setName(aliasName)
            .setTabCompletions([aliasName]);
        
        ChatLib.chat(`Alias ${aliasName} created with command: ${command}`);
    } catch (e) {
        ChatLib.chat(`Failed to create alias: ${e.message}`);
    }
}).setName("makealias")
    .setTabCompletions(["makealias"]);

register("command", (aliasName) => {
    try {
        let alias = JSON.parse(FileLib.read(getAliasFileLocation()));
        if (alias[aliasName]) {
            delete alias[aliasName];
            FileLib.write(getAliasFileLocation(), JSON.stringify(alias, null, 2));
            ChatLib.chat(`Alias ${aliasName} deleted.`);
        } else {
            ChatLib.chat(`Alias ${aliasName} does not exist.`);
        }
    } catch (e) {
        ChatLib.chat(`Failed to delete alias: ${e.message}`);
    }
}).setName("deletealias")
    .setTabCompletions(["deletealias"]);

register("command", () => {
    try {
        let alias = JSON.parse(FileLib.read(getAliasFileLocation()));
        ChatLib.chat(`Aliases: ${JSON.stringify(alias, null, 2)}`);
    } catch (e) {
        ChatLib.chat(`Failed to load aliases: ${e.message}`);
    }
}).setName("listaliases")
    .setTabCompletions(["listaliases"]);


// Chat Triggers doesn't load files unless they are used somewhere, so we need to create a dummy function to force it to load the file
export function pointLess() {
    return;
}