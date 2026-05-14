document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and activity options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const title = document.createElement("h4");
        title.textContent = name;

        const description = document.createElement("p");
        description.textContent = details.description;

        const schedule = document.createElement("p");
        schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const availability = document.createElement("p");
        const spotsLeft = details.max_participants - details.participants.length;
        availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants";

        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participants";
        participantsSection.appendChild(participantsTitle);

        if (details.participants.length) {
          const participantsList = document.createElement("ul");
          details.participants.forEach((email) => {
            const listItem = document.createElement("li");
            listItem.className = "participant-item";

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = email;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "participant-delete";
            deleteButton.textContent = "✕";
            deleteButton.title = `Remove ${email}`;
            deleteButton.addEventListener("click", async () => {
              try {
                const deleteResponse = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(email)}`,
                  {
                    method: "DELETE",
                  }
                );

                const deleteResult = await deleteResponse.json();
                if (deleteResponse.ok) {
                  messageDiv.textContent = deleteResult.message;
                  messageDiv.className = "success";
                  messageDiv.classList.remove("hidden");
                  fetchActivities();
                } else {
                  messageDiv.textContent = deleteResult.detail || "Failed to remove participant.";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
              } catch (deleteError) {
                messageDiv.textContent = "Could not remove participant. Please try again.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                console.error("Error removing participant:", deleteError);
              }
            });

            listItem.appendChild(emailSpan);
            listItem.appendChild(deleteButton);
            participantsList.appendChild(listItem);
          });
          participantsSection.appendChild(participantsList);
        } else {
          const noParticipants = document.createElement("p");
          noParticipants.className = "no-participants";
          noParticipants.textContent = "No participants yet.";
          participantsSection.appendChild(noParticipants);
        }

        activityCard.appendChild(title);
        activityCard.appendChild(description);
        activityCard.appendChild(schedule);
        activityCard.appendChild(availability);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
