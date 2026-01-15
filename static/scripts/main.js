document.addEventListener("DOMContentLoaded", () => {
    if (document.body.id == "index") {
        const body = document.querySelector("body");
        const searchForm = body.querySelector("#search");
        const searchInput = body.querySelector("#search input");
        const llm_msg = body.querySelector(".response .content");

        searchForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // let form = Object.fromEntries(new FormData(searchForm));
            let form = new FormData(searchForm);
            let q = form.get("q");
            searchInput.value = "";

            try {
                r = await fetch("/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({q})
                })
                let data = await r.json();
                console.log(data.msg);

                llm_msg.innerHTML = data.msg;

            } catch(error) {
                console.log("Unexpected error => " + error)
            }
        })
    }
})