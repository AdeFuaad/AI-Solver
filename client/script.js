import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      // element.textContent += text[index];
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 100000);
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="chat-stripe ${isAi ? "ai" : ""}">
      <div class="chat">
      <div class="profile">
        <img 
        src="${isAi ? bot : user}"
        alt="${isAi ? "bot" : "user"}"
        >
      </div>
      <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chatStripe(false, data.get("prompt"), generateUniqueId());

  form.reset();

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  try {
    const response = await fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.get("prompt"),
      }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
      const responseData = await response.json();
      const parsedData = responseData.bot.trim();

      // console.log(parsedData)
      typeText(messageDiv, parsedData);
    } else {
      const errorText = await response.text();
      messageDiv.innerHTML = "ME thinks something went wrong";
      alert(errorText);
    }
  }  catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      const openaiError = error.response.data.error;
      console.log("OpenAI API Error:", openaiError);
      // Handle OpenAI API error
    } else {
      console.log("Unexpected error occurred:", error);
      // Handle other errors
    }
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
