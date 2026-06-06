const BACKEND_URL = "https://master.d105jspeg7cw15.amplifyapp.com";

const btn = document.createElement("button");
btn.innerHTML = "Sync to DashNote";
btn.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  padding: 10px;
  background: #000;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
`;

btn.onmouseover = () => btn.style.background = '#d06262';
btn.onmouseout = () => btn.style.background = '#483c3c';

document.body.appendChild(btn);

btn.onclick = async () => {
    btn.innerHTML = "Syncing...";
    btn.disabled = true;

    const elements = document.querySelectorAll('inline-chunk, .query-text, .reply-content');
    const chatArr = Array.from(elements).map(el => el.innerText.trim()).filter(Boolean);

    if (chatArr.length === 0) {
        alert("Nothing caught, please check if there is content");
        btn.innerHTML = "Sync to DashNote";
        btn.disabled = false;
        return;
    }

    const fullText = chatArr.join('\n\n---\n\n');

    try {
        const response = await fetch(`${BACKEND_URL}/api/summary`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rawText: fullText,
                date: new Date().toISOString().split('T')[0]
            })
        });

        const resData = await response.json();

        if (response.ok) {
            alert(`Sync successful: ${resData?.title || 'Generated'}`);
            btn.innerHTML = "✅ Synced!";
        } else {
            alert(`Failed: ${resData?.error || resData?.message || 'Unknown error'}`);
            btn.innerHTML = "❌ Failed - Retry";
        }
    } catch (error) {
        console.error("Send error", error);
        alert("Cannot connect to DashNote Backend.");
        btn.innerHTML = "❌ Failed - Retry";
    } finally {
        btn.disabled = false;
    }
};