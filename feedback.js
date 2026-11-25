/* Townlapse "Report a problem" button: a small floating button + dialog. Sends the page, the message and (if this
   browser has one) the donor key, which the server uses only to look up the donation; it is never stored. */
(() => {
  const API = "https://api.townlapse.org/api/tl/feedback";
  const css = `
  .tlfb-btn{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9999;font:600 14px "Public Sans",system-ui,sans-serif;
    background:#243135;color:#F3EEE3;border:1px solid #3A4A4F;border-radius:999px;padding:10px 14px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}
  .tlfb-btn:hover,.tlfb-btn:focus-visible{border-color:#EBC55A;outline:none}
  .tlfb-dlg{border:1px solid #3A4A4F;border-radius:14px;background:#1C2629;color:#F3EEE3;padding:18px 20px;width:min(460px,calc(100vw - 32px));font:16px/1.5 "Public Sans",system-ui,sans-serif}
  .tlfb-dlg::backdrop{background:rgba(0,0,0,.55)}
  .tlfb-dlg h2{margin:0 0 6px;font:800 24px "Big Shoulders Display",Impact,sans-serif}
  .tlfb-dlg p{margin:0 0 10px;color:#B9B3A6;font-size:14px}
  .tlfb-dlg textarea,.tlfb-dlg input{width:100%;box-sizing:border-box;font:15px "Public Sans",system-ui,sans-serif;color:#F3EEE3;background:#243135;border:1px solid #3A4A4F;border-radius:10px;padding:10px 12px;margin:4px 0 10px}
  .tlfb-dlg textarea{min-height:110px;resize:vertical}
  .tlfb-row{display:flex;gap:10px;justify-content:flex-end;align-items:center}
  .tlfb-row button{font:600 15px "Public Sans",system-ui,sans-serif;border-radius:999px;padding:9px 18px;cursor:pointer;border:0}
  .tlfb-send{background:#EBC55A;color:#1b1b1b}.tlfb-cancel{background:transparent;color:#F3EEE3;border:1px solid #3A4A4F!important}
  .tlfb-msg{font-size:14px;margin-right:auto}.tlfb-ok{color:#8FD1A8}.tlfb-err{color:#E58C8C}
  .tlfb-hp{position:absolute;left:-9999px}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const btn = document.createElement("button"); btn.className = "tlfb-btn"; btn.type = "button"; btn.textContent = "Report a problem";
  const dlg = document.createElement("dialog"); dlg.className = "tlfb-dlg"; dlg.setAttribute("aria-labelledby", "tlfb-h");
  dlg.innerHTML = `<h2 id="tlfb-h">Report a problem</h2>
    <p>What happened, and what did you expect? We'll see this page and your donation's status, so you don't need to paste keys or screenshots of settings.</p>
    <label for="tlfb-text" class="tlfb-hp">Message</label><textarea id="tlfb-text" maxlength="4000" placeholder="e.g. Gemini says I have 0 assignments left, but this page says 27."></textarea>
    <label for="tlfb-email" style="font-size:14px;color:#B9B3A6">Email for a reply <span style="opacity:.8">(optional)</span></label>
    <input id="tlfb-email" type="email" autocomplete="email">
    <input class="tlfb-hp" id="tlfb-website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="tlfb-row"><span class="tlfb-msg" id="tlfb-msg" role="status" aria-live="polite"></span><button type="button" class="tlfb-cancel" id="tlfb-cancel">Close</button><button type="button" class="tlfb-send" id="tlfb-send">Send</button></div>`;
  document.body.append(btn, dlg);
  const $ = id => dlg.querySelector("#" + id);
  btn.onclick = () => { $("tlfb-msg").textContent = ""; dlg.showModal(); $("tlfb-text").focus(); };
  $("tlfb-cancel").onclick = () => dlg.close();
  $("tlfb-send").onclick = async () => {
    const text = $("tlfb-text").value.trim(); if (text.length < 3) { $("tlfb-msg").textContent = "Add a few words first."; $("tlfb-msg").className = "tlfb-msg tlfb-err"; return; }
    let key = null; try { key = localStorage.getItem("townlapse_donor_key"); } catch {}
    $("tlfb-send").disabled = true; $("tlfb-msg").textContent = "Sending…"; $("tlfb-msg").className = "tlfb-msg";
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: location.href, text, email: $("tlfb-email").value.trim(), key, website: $("tlfb-website").value }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Couldn't send.");
      $("tlfb-msg").textContent = "Thanks! It's in."; $("tlfb-msg").className = "tlfb-msg tlfb-ok"; $("tlfb-text").value = "";
      setTimeout(() => dlg.close(), 1400);
    } catch (e) { $("tlfb-msg").textContent = e.message; $("tlfb-msg").className = "tlfb-msg tlfb-err"; }
    $("tlfb-send").disabled = false;
  };
})();
