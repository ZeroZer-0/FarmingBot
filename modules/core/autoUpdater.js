import { logDebug } from "./logger";

const URL = Java.type("java.net.URL");
const HttpURLConnection = Java.type("java.net.HttpURLConnection");
const BufferedReader = Java.type("java.io.BufferedReader");
const InputStreamReader = Java.type("java.io.InputStreamReader");
const BufferedInputStream = Java.type("java.io.BufferedInputStream");
const FileOutputStream = Java.type("java.io.FileOutputStream");
const ZipInputStream = Java.type("java.util.zip.ZipInputStream");
const File = Java.type("java.io.File");
const FileOutputStreamJava = Java.type("java.io.FileOutputStream");
let Thread = Java.type("java.lang.Thread");

const CURRENT_VERSION = "v1.1.2";
const REPO = "ZeroZer-0/FarmingBot";
const DEST_FOLDER = `./config/ChatTriggers/Modules/`;
const TMP_ZIP_PATH = "./config/FarmBot/update.zip";

function doGetRequest(urlString) {
    try {
        let url = new URL(urlString);
        logDebug("Performing GET request to: " + urlString);
        let connection = url.openConnection();
        connection.setRequestProperty("User-Agent", "FarmBot-Updater");

        if (connection instanceof HttpURLConnection) {
            connection.setRequestMethod("GET");
            connection.connect();
        } else {
            logDebug("Connection is not an HttpURLConnection");
            return "";
        }
        let responseCode = connection.getResponseCode();
        logDebug("Response code: " + responseCode);

        let reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        let response = "", line;
        while ((line = reader.readLine()) !== null) {
            response += line;
        }
        reader.close();
        connection.disconnect();
        return response;
    } catch (e) {
        logDebug("Error performing GET request: " + e);
        return "";
    }
}

function extractZip(zipPath, destFolder) {
    try {
        let zipFile = new File(zipPath);
        let input = new ZipInputStream(new BufferedInputStream(new java.io.FileInputStream(zipFile)));
        let entry;

        let tempExtractPath = new File("./config/FarmBot/Temp/");
        if (tempExtractPath.exists()) deleteFolderRecursive(tempExtractPath.getAbsolutePath());
        tempExtractPath.mkdirs();

        while ((entry = input.getNextEntry()) !== null) {
            let outPath = new File(tempExtractPath, entry.getName());

            if (entry.isDirectory()) {
                outPath.mkdirs();
            } else {
                let parent = outPath.getParentFile();
                if (!parent.exists()) parent.mkdirs();

                let out = new FileOutputStreamJava(outPath);
                let byte;
                while ((byte = input.read()) !== -1) {
                    out.write(byte);
                }
                out.close();
            }

            input.closeEntry();
        }

        input.close();

        let folders = tempExtractPath.listFiles();
        let extractedRoot = null;
        for (let i = 0; i < folders.length; i++) {
            if (folders[i].isDirectory()) {
                extractedRoot = folders[i];
                break;
            }
        }

        if (extractedRoot === null) {
            logDebug("No root folder found in zip.");
            return;
        }

        let finalPath = new File("./config/ChatTriggers/modules/FarmBot");
        if (finalPath.exists()) deleteFolderRecursive(finalPath.getAbsolutePath());

        if (!extractedRoot.renameTo(finalPath)) {
            logDebug("Failed to rename extracted folder.");
            return;
        }

        deleteFolderRecursive(tempExtractPath.getAbsolutePath());

        let zipToDelete = new File(zipPath);
        if (zipToDelete.exists()) zipToDelete.delete();

        logDebug("Extraction complete. Updated FarmBot module.");
    } catch (e) {
        logDebug("Unzip error: " + e);
    }
}

function deleteFolderRecursive(path) {
    let folder = new File(path);
    if (folder.exists()) {
        let files = folder.listFiles();
        for (let i = 0; i < files.length; i++) {
            if (files[i].isDirectory()) {
                deleteFolderRecursive(files[i].getAbsolutePath());
            } else {
                files[i].delete();
            }
        }
        folder.delete();
    }
}



function downloadZipFile(fileURL, outputPath) {
    try {
        let url = new URL(fileURL);
        let connection = url.openConnection();
        connection.setRequestProperty("User-Agent", "FarmBot-Updater");

        if (connection instanceof HttpURLConnection) {
            connection.setRequestMethod("GET");
            connection.connect();
        } else {
            logDebug("Connection is not an HttpURLConnection");
            return;
        }

        logDebug("Downloading ZIP Started");

        let input = new BufferedInputStream(connection.getInputStream());
        let output = new FileOutputStream(outputPath);

        let byte;
        while ((byte = input.read()) !== -1) {
            output.write(byte);
        }

        input.close();
        output.close();
        connection.disconnect();

        logDebug("Downloaded ZIP to: " + outputPath);
    } catch (e) {
        logDebug("Download ZIP error: " + e);
    }
}

export function checkForUpdate() {
    new Thread(function () {
        let releaseJson = doGetRequest("https://api.github.com/repos/" + REPO + "/releases/latest");
        if (!releaseJson) return;

        let release = JSON.parse(releaseJson);
        let latestVersion = release.tag_name;

        if (latestVersion !== CURRENT_VERSION) {
            ChatLib.chat("New version available: " + latestVersion);
            ChatLib.chat("&c[FarmBot] New version has been found and is being installed for you!");
            ChatLib.chat("&c[FarmBot] Please wait while until chat triggers is reloaded before using.");

            let zipUrl = release.zipball_url;
            if (zipUrl) {
                logDebug("Downloading ZIP from: " + zipUrl);
                downloadZipFile(zipUrl, TMP_ZIP_PATH);
                extractZip(TMP_ZIP_PATH, DEST_FOLDER);
                logDebug("Update applied.");
                ChatLib.chat(`&c[FarmBot] Update complete! Please use "/ct load" reload chat triggers now.`);
                return;
            }

            logDebug("No .zip asset found in the latest release.");
        } else {
            logDebug("You are running the latest version.");
        }
    }).start();
}