document.addEventListener("DOMContentLoaded", () => {
    if (document.body.id === "signup") {
        const body = document.querySelector("body");
        const profileBtn = body.querySelector(".right .profile");
        const profile = body.querySelector(".statusText");
        const main = body.querySelector("main");
        const matching = body.querySelector(".signup form .field .matching");
        const strength = body.querySelector(".signup form .field .strength");
        const warn = body.querySelector(".signup .warn");
        const eyes = body.querySelectorAll(".signup form .field img");
        const passwordInput = body.querySelectorAll(".signup form .field .password");

        main.addEventListener("click", () => {
            if (profile.classList.contains("show")) {
                profile.classList.remove("show");
            }
        })

        profileBtn.addEventListener("click", () => {
            if (profile.classList.contains("show")) {
                profile.classList.remove("show");
            }
            else {
                profile.classList.add("show");
            }
        })

        for (let i=0; i < eyes.length; i++) {
            eyes[i].addEventListener("click", (e) => {
                let eye = e.currentTarget
                
                if (passwordInput[i].type == "password") {
                    eye.src = "/static/images/openeye.png";
                    passwordInput[i].type = "text";
                } else {
                    eye.src = "/static/images/closedeye.png";
                    passwordInput[i].type = "password";
                }
            })
        }
        

    }
    else if (document.body.id == "index") {
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
                alert(`Unexpected Error: ${error}`)
            }
        })
    }
})