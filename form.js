// === Updated form.js (with required receipt validation for E-Banking) ===
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("givingForm");
  const submitBtn = form.querySelector('button[type="submit"]');
  const confirmationMessage = document.getElementById("confirmationMessage");
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const paymentTypeInput = document.getElementById("paymentTypeInput");
  const receiptGroup = document.getElementById("receiptUploadGroup");
  const receiptInput = document.getElementById("receiptInput");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwmu3yl9qHdfb_hUtiGbk6hYWRInm5h8DkWsah4l3LaSVb0ZwZOxn5JXS0Kz8MSCGh4/exec"; // Replace with actual script URL

  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      toggleButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      paymentTypeInput.value = button.getAttribute("data-type");
      receiptGroup.style.display = paymentTypeInput.value === "e-banking" ? "block" : "none";
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const paymentType = paymentTypeInput.value;
    const isEBanking = paymentType === "e-banking";

    // Validate receipt upload for E-Banking
    if (isEBanking && receiptInput.files.length === 0) {
      alert("Please upload your payment receipt before submitting.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const fd = new FormData(form);

    if (isEBanking) {
      const file = receiptInput.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        const base64 = reader.result.split(",")[1];
        fd.append("receipt", base64);
        fd.append("contentType", file.type);
        submit(fd);
      };

      reader.readAsDataURL(file);
    } else {
      submit(fd);
    }
  });

  function submit(data) {
    fetch(SCRIPT_URL, {
      method: "POST",
      body: data,
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
          alert("Submission failed. Please try again.");
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
