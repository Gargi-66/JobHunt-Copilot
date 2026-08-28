const [jobDescription, setJobDescription] = useState("");

fetch("http://127.0.0.1:8000/analyze-jd", {
    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        job_description: jobDescription
    })
})