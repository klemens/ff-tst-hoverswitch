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
    timer = null;

    try {
        console.log("switch to " + tab);
        await browser.runtime.sendMessage(TST_ID, {
            type: "focus",
            tab: tab
        });
    } catch(e) {
        console.log("tab vanished..." + e);
    }
}


let timer = null;
function startTimer(tab) {
    let callback = async () => {
        timer = null;
        await activateTab(tab);
    };
    timer = setTimeout(callback, 100);
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

    let tab = message.tab;
    switch (message.type) {
        case "ready":
            registerToTST();
            break;
        case "tab-mouseover":
            console.log("enter tab " + tab.id + ": " + tab.title);

            stopTimer();
            if(tab.states.includes("active")) {
                break;
            }
            startTimer(tab.id);
            break;
        case "tab-mouseout":
            console.log("leave tab " + tab.id);

            stopTimer();
            break;
    }
});

registerToTST();
