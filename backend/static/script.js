const button = document.getElementById("getJobsButton");

const jobsContainer = document.getElementById("jobs");


button.addEventListener("click", function() {

    fetch("/jobs")

        .then(function(response) {
            return response.json();
        })

        .then(function(data) {

            console.log(data);

            jobsContainer.innerHTML = "";

            data.forEach(function(job) {

                jobsContainer.innerHTML += `
                    <p>${job.company} - ${job.role}</p>
                `;

            });

        });

});