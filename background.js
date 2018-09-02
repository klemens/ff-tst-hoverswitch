"use strict";

const TST_ID = "treestyletab@piro.sakura.ne.jp";
const DEFAULT_SETTINGS = {
    // Delay in ms before switching to hovered tab
    "switching-delay": 100,
};

// The current settings
let settings;

// Load settings, setup listeners and register to TST
(async () => {
    settings = await browser.storage.local.get(DEFAULT_SETTINGS);
    await browser.storage.local.set(settings); // Save any missing defaults

    browser.storage.onChanged.addListener(handleSettingsChange);
    browser.runtime.onMessageExternal.addListener(handleTSTMessage);

    // Register directly in case we are activated after TST
    await registerToTST();
})();

async function handleSettingsChange(changes) {
    for(let key in changes) {
        let change = changes[key];
        if(change.newValue !== undefined) {
            settings[key] = change.newValue;
        }
    }
}

async function registerToTST() {
    try {
        const self = await browser.management.getSelf();
        await browser.runtime.sendMessage(TST_ID, {
            type: "register-self",
            name: self.id,
            listeningTypes: ["ready", "tab-mouseover", "tab-mouseout"]
        });
    } catch(e) {
        // Could not register
        console.log("Could not register to TST")
        return false;
    }

    return true;
}

async function activateTab(tab) {
    try {
        await browser.runtime.sendMessage(TST_ID, {
            type: "focus",
            tab: tab
        });
    } catch(e) {
        // Happens when the tab is closed during the timeout
    }
}


let timer = null;
function startTimer(tab) {
    let callback = async () => {
        timer = null;
        await activateTab(tab);
    };
    timer = setTimeout(callback, settings["switching-delay"]);
}
function stopTimer() {
    if(timer !== null) {
        clearTimeout(timer);
        timer = null;
    }
}

async function handleTSTMessage(message, sender) {
    if(sender.id !== TST_ID) {
        return;
    }

    switch (message.type) {
        case "ready":
            registerToTST();
            break;

        case "tab-mouseover":
            stopTimer();

            let tab = message.tab;
            startTimer(tab.id);
            break;

        case "tab-mouseout":
            stopTimer();
            break;
    }
}
