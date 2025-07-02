document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("givingForm");
  const submitBtn = form.querySelector('button[type="submit"]');
  const confirmationMessage = document.getElementById("confirmationMessage");

  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const paymentTypeInput = document.getElementById("paymentTypeInput");
  const receiptGroup = document.getElementById("receiptUploadGroup");
  const receiptInput = document.getElementById("receiptInput");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwmu3yl9qHdfb_hUtiGbk6hYWRInm5h8DkWsah4l3LaSVb0ZwZOxn5JXS0Kz8MSCGh4/exec";

  // Toggle button behavior
  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      toggleButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const selectedType = button.getAttribute("data-type");
      paymentTypeInput.value = selectedType;

      receiptGroup.style.display = selectedType === "e-banking" ? "block" : "none";
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    if (receiptInput.files.length > 0) {
      const file = receiptInput.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64 = reader.result.split(",")[1];
        jsonData["receipt"] = base64;
        jsonData["contentType"] = file.type;

        sendData(jsonData);
      };

      reader.readAsDataURL(file);
    } else {
      sendData(jsonData);
    }
  });

  function sendData(data) {
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.text())
      .then(response => {
        if (response.includes("Success")) {
          confirmationMessage.style.display = "block";
          submitBtn.textContent = "Submitted ✅";
          form.reset();
          document.querySelector('.toggle-btn[data-type="cash"]').click();

          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Giving Details";
            confirmationMessage.style.display = "none";
          }, 4000);
        } else {
          alert("Submission failed: " + response);
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Giving Details";
        }
      })
      .catch(error => {
        alert("Submission failed: " + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Giving Details";
      });
  }
});
