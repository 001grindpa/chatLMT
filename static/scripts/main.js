document.addEventListener("DOMContentLoaded", () => {
    if (document.body.id === "signup") {
        const body = document.querySelector("body");
        const profileBtn = body.querySelector(".right .profile");
        const profile = body.querySelector(".statusText");
        const main = body.querySelector("main");
        const matching = body.querySelector(".signup form .field .matching");
        const strength = body.querySelector(".signup form .field .strength");
        const check_password = body.querySelector(".signup form .field .check_username");
        const warn = body.querySelector(".signup .warn");
        const eyes = body.querySelectorAll(".signup form .field img");
        const passwordInput = body.querySelectorAll(".signup form .field .password");
        const allInputs = body.querySelectorAll(".signup form div input");
        const form = body.querySelector(".signup form");
        const formBtn = body.querySelector(".signup form button");
        
        
        for (let i=0; i<allInputs.length; i++) {
            allInputs[i].addEventListener("input", () => {
                // checking username length
                if (allInputs[i].name == "username") {
                    if (allInputs[i].value.length <= 3) {
                        check_password.innerHTML = "at least 4 chars long"
                    }
                    else {
                        check_password.innerHTML = "valid username"
                    }
                }

                // making sure all inputs are entered
                for (let input of allInputs) {
                    if (!input.value) {
                        formBtn.style.backgroundColor = "gray";
                        return formBtn.disabled = true;
                    }
                }
                formBtn.style.backgroundColor = "var(--brand-color-light)";
                return formBtn.disabled = false;
            })
        }

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
        
        passwordInput[0].addEventListener("input", async (e) => {
            let input = e.currentTarget;

            try {
                let r = await fetch("/check_password?q=" + input.value);
                let data = await r.json();

                console.log(data.msg);
                if (data.msg == "valid password") {
                    strength.style.backgroundColor = "green";
                    strength.style.color = "white";
                }
                else {
                    strength.style.backgroundColor = "white";
                    strength.style.color = "black";
                }
                strength.innerHTML = data.msg
            }
            catch(error) {
                console.log("Unexpected error: " + error)
            }
        })

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