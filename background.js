// Delay in ms before switching to hovered tab
const DELAY = 100;
const TST_ID = "treestyletab@piro.sakura.ne.jp";

async function registerToTST() {
    try {
        var success = await browser.runtime.sendMessage(TST_ID, {
            type: "register-self",
            listeningTypes: ["tab-mouseover", "tab-mouseout"]
        });
    } catch(e) {
        // Could not register
    }
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
    timer = setTimeout(callback, DELAY);
}
function stopTimer() {
    if(timer !== null) {
        clearTimeout(timer);
        timer = null;
    }
}

browser.runtime.onMessageExternal.addListener(async (message, sender) => {
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
});

// Register directly in case we are activated after TST
registerToTST();
