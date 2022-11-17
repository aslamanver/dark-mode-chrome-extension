//
const addCSS = css => document.head.appendChild(document.createElement("style")).innerHTML = css;

const getDomain = function (url) {
  return url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
}

// chrome.runtime.onInstalled.addListener(async () => {
//   let url = chrome.runtime.getURL("popup.html");
//   let tab = await chrome.tabs.create({ url });
//   console.log(`Created tab ${tab.id}`);
// });

function enableDarkMode() {
  document.getElementsByTagName('html')[0].classList.add("dk-mode");
}

function disableDarkMode() {
  document.getElementsByTagName('html')[0].classList.remove("dk-mode");
}

async function switchDarkMode(chrome, tab) {

  const domain = getDomain(tab.url);
  const data = await chrome.storage.sync.get([domain]);

  if (data[domain] == "activated") {

    await chrome.storage.sync.remove([domain]);

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: disableDarkMode
    });

    chrome.action.setBadgeBackgroundColor({ color: '#808080' })
    chrome.action.setBadgeText({ tabId: tab.id, text: 'off' });

  } else {

    await chrome.storage.sync.set({ [domain]: "activated" });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: enableDarkMode
    });

    chrome.action.setBadgeBackgroundColor({ color: '#00FF00' })
    chrome.action.setBadgeText({ tabId: tab.id, text: 'on' });
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  await switchDarkMode(chrome, tab);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

  const css = {
    target: { tabId: tab.id },
    files: ["inject.css"]
  };

  await chrome.scripting.insertCSS(css);

  const domain = getDomain(tab.url);
  const data = await chrome.storage.sync.get([domain]);

  if (data[domain] == "activated") {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: enableDarkMode
    });

  }

  chrome.action.setBadgeBackgroundColor({ color: data[domain] == "activated" ? '#00FF00' : '#808080' })
  chrome.action.setBadgeText({ tabId: tab.id, text: data[domain] == "activated" ? 'on' : 'off' });

});

chrome.commands.onCommand.addListener(async (command, tab) => {
  await switchDarkMode(chrome, tab);
});