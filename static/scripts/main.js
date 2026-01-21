document.addEventListener("DOMContentLoaded", async () => {
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
        const redirectToLoginTxt = body.querySelector(".signSuccess .imgs + div");
        const successCont = body.querySelector(".successCont");
        const redirectToLogin = body.querySelector(".successCont form input");
        const successGif = body.querySelector(".signSuccess .imgs img:nth-child(1)");
        const successImg = body.querySelector(".signSuccess .imgs img:nth-child(2)");


        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            let formdata = Object.fromEntries(new FormData(form));
            let new_form = new FormData(form);
            let username = new_form.get("username");
            // console.log(username);

            try {
                let r = await fetch("/signup", {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formdata)
                })
                let d = await r.json();
                console.log(d.msg);
                if (d.msg == "successful sign in") {
                    body.style.overflowY = "hidden";
                    successCont.style.display = "block";
                    successGif.classList.add("hide");
                    successImg.classList.add("show");

                    setTimeout(() => redirectToLoginTxt.style.display = "block", 3000);
                    setTimeout(() => redirectToLogin.click(), 4500);
                } else if (d.msg == "This account already exists, try loging in.") {
                    return alert(`${d.msg}`);
                } else if (d.msg == `The username '${username}' is already claimed, try a different one.`) {
                    return alert(`${d.msg}`);
                }
            }
            catch(error) {
                console.log("Unexpected error: " + error)
            }
        })

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

         passwordInput[0].addEventListener("input", async (e) => {
            let input = e.currentTarget;

            try {
                let r = await fetch("/check_password?q=" + input.value);
                let data = await r.json();

                console.log(data);
                if (data.msg == "valid password") {
                    strength.style.backgroundColor = "green";
                    strength.style.color = "white";
                    // store valid password
                    localStorage.setItem("valid_password", true);
                }
                else {
                    strength.style.backgroundColor = "white";
                    strength.style.color = "black";
                    // store invalid password
                    localStorage.setItem("valid_password", false);
                }
                strength.innerHTML = data.msg
            }
            catch(error) {
                console.log("Unexpected error: " + error)
            }
        });

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
            });
            passwordInput[i].addEventListener("input", () => {
                if (passwordInput[0].value == passwordInput[1].value && localStorage.getItem("valid_password") == "true") {
                    warn.innerHTML = "valid password match";
                    warn.style.color = "green";
                    localStorage.setItem("valid_password_match", true);
                } 
                else {
                    warn.innerHTML = "error in password creation";
                    warn.style.color = "red";
                    localStorage.setItem("valid_password_match", false);
                }
            });
        }

        for (let i=0; i<allInputs.length; i++) {
            allInputs[i].addEventListener("input", () => {
                // checking username length
                if (allInputs[i].name == "username") {
                    if (allInputs[i].value.length <= 3) {
                        check_password.innerHTML = "at least 4 chars long"
                        localStorage.setItem("valid_username", false);
                    }
                    else if (allInputs[i].value.length >= 12) {
                        check_password.innerHTML = "not more than 12 chars long";
                        localStorage.setItem("valid_username", false);
                    }
                    else {
                        check_password.innerHTML = "valid username";
                        localStorage.setItem("valid_username", true);
                    }
                }

                // making sure all inputs are entered
                for (let input of allInputs) {
                    if (!input.value) {
                        formBtn.style.backgroundColor = "gray";
                        return formBtn.disabled = true;
                    }
                }
                if (localStorage.getItem("valid_username") == "true" && localStorage.getItem("valid_password_match") == "true") {
                    formBtn.style.backgroundColor = "var(--brand-color-light)";
                    return formBtn.disabled = false;
                }
                else {
                    formBtn.style.backgroundColor = "gray";
                    return formBtn.disabled = true;
                }
            })
        }

    }
    else if (document.body.id == "login") {
        const eye = document.querySelector(".signup form .field img");
        const passwordInput = document.querySelector(".signup form .field .password");
        const profileBtn = document.querySelector(".right .profile");
        const profile = document.querySelector(".statusText");
        const main = document.querySelector("main");
        const form = document.querySelector(".signup form");
        const toLoginBtn = document.querySelector("main #toLogin button");
        
        // form.style.color = "red";

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            let formdata = Object.fromEntries(new FormData(form));

            try {
                let r = await fetch("/login", {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formdata)
                })
                let d = await r.json();
                console.log(d.msg);
                if (d.msg == "This account does not exist, please check again or sign up.") {
                    return alert(`${d.msg}`);
                } else if (d.msg == "login") {
                    return toLoginBtn.click();
                }
            }
            catch(error) {
                console.log("Unexpected error: " + error);
            }
        })

        eye.addEventListener("click", () => {
            if (passwordInput.type == "password") {
                eye.src = "/static/images/openeye.png";
                passwordInput.type = "text";
            } else {
                eye.src = "/static/images/closedeye.png";
                passwordInput.type = "password";
            }
        })

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

    }
    else if (document.body.id == "index") {
        const body = document.querySelector("body");
        const chatCont = document.querySelector(".chatCont");
        const chatArea = body.querySelector(".chatArea");
        const searchForm = body.querySelector("#search");
        const searchInput = body.querySelector("#search input");
        const profileBtn = body.querySelector(".right .profile");
        const profile = body.querySelector(".statusText");
        const main = body.querySelector("main");
        const sideBar = body.querySelector(".chat_grid .sideBar");
        const hamburger = body.querySelector(".menuBar .left .hambugger");
        const clearChat = body.querySelector(".sideBar form + div");
        const formBtnLoader = body.querySelector("#search img:nth-child(2)");
        const formBtnLogo = body.querySelector("#search img:nth-child(1)");
        const formBtn = body.querySelector("#search button");

        // aauto retrieve current chat history
        async function retrieve_chat() {
            try {
                let r = await fetch("/get_chat");
                let d = await r.json();
                // console.log(d.msg)
                for (let i of d.msg) { 
                    for (let j in JSON.parse(i.chat)) {
                        // human text rendering
                        let hContent = document.createElement("div");
                        let humanTextCont = document.createElement("div");
                        
                        humanTextCont.classList.add("humanText");
                        hContent.classList.add("Hcontent");

                        hContent.textContent = j;
                        
                        humanTextCont.appendChild(hContent);

                        chatArea.appendChild(humanTextCont);

                        // bot response text rendering
                        let response = document.createElement("div");
                        let content = document.createElement("div");

                        response.classList.add("response");

                        chatArea.appendChild(response);
                        content.classList.add("content");
                        content.innerHTML = JSON.parse(i.chat)[j];
                        response.appendChild(content);
                        chatArea.scrollTop = chatArea.scrollHeight;
                    }
                }
            }
            catch(error) {
                console.log("Unexpected error: " + error)
            }
        }
        // call auto retieval
        await retrieve_chat();

        // clear current chat from UI
        clearChat.addEventListener("click", async () => {
            try {
                let r = await fetch("/clear_chat");
                let d = await r.json();
                console.log(d.msg)
                chatArea.innerHTML = "";
            }
            catch(error) {
                console.log("Unexpected error: " + stringify(error))
            }
        })

        // what happens after midnight
        if (Date.now() >= Number(localStorage.getItem("midnight"))) {
            localStorage.removeItem("midnight");
            localStorage.removeItem("expanded");
            await clear_memory();
        }

        // setting up midnight deadline timer
        let currentHr = new Date().getHours();
        let midnight = 24-currentHr;
        let midnightInUnix = Date.now() + (midnight*3600*1000);
        if (!localStorage.getItem("midnight")) {
            localStorage.setItem("midnight", midnightInUnix);
        }
        console.log(localStorage.getItem("midnight"), Date.now());

        // this function clears bot memory
        async function clear_memory() {
            try {
                let r = await fetch("/clear_memory");
                let d = await r.json();
                console.log(d.msg)
            }
            catch(error) {
                console.log("Unexpected error: " + stringify(error))
            }
        }

        // console.log(currentHr, midnightInUnix, Date.now());

        hamburger.addEventListener("click", () => {
            if (sideBar.style.left < "-50%") {
                sideBar.style.left = "0%";
            }
            else {
                sideBar.style.left = "-100%"
            }
        }) 

        if (localStorage.getItem("expanded") == "true") {
            chatCont.classList.add("expand");
        }

        searchInput.addEventListener("click", () => {
            if (!localStorage.getItem("expanded")) {
                chatCont.classList.add("expand");
                localStorage.setItem("expanded", true);
            }
        })

        main.addEventListener("click", () => {
            if (profile.classList.contains("show")) {
                profile.classList.remove("show");
            }
            sideBar.style.left = "-100%";
        })

        profileBtn.addEventListener("click", () => {
            if (profile.classList.contains("show")) {
                profile.classList.remove("show");
            }
            else {
                profile.classList.add("show");
            }
        })

        searchForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if ((searchInput.value).trim() == "") {
                return alert(`Please insert a text first before attempting send.`)
            }
            formBtnLogo.style.display = "none";
            formBtnLoader.style.display = "block";
            formBtn.style.cursor = "progress";
            formBtn.disabled = true;

            let form = new FormData(searchForm);
            let q = form.get("q");

            // human text rendering
            let hContent = document.createElement("div");
            let humanTextCont = document.createElement("div");
            
            humanTextCont.classList.add("humanText");
            hContent.classList.add("Hcontent");

            hContent.textContent = searchInput.value;
            
            humanTextCont.appendChild(hContent);

            chatArea.appendChild(humanTextCont);
            searchInput.value = "";

            // rendering bot response text
            let response = document.createElement("div");
            let loaderGif = document.createElement("img");
            let content = document.createElement("div");

            response.classList.add("response");
            loaderGif.src = "static/gif/loading2.gif";

            response.appendChild(loaderGif);
            chatArea.appendChild(response);
            chatArea.scrollTop = chatArea.scrollHeight;

            try {
                r = await fetch("/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({q})
                })
                let data = await r.json();
                // console.log(data.msg);

                setTimeout(() => {
                    loaderGif.style.display = "none";
                    content.classList.add("content");
                    content.innerHTML = data.msg;
                    response.appendChild(content);
                    chatArea.scrollTop = chatArea.scrollHeight;
                    formBtnLogo.style.display = "block";
                    formBtnLoader.style.display = "none";
                    formBtn.style.cursor = "pointer";
                    formBtn.disabled = false;
                }, 2000)
            } 
            catch(error) {
                console.log("Unexpected error => " + error)
                alert(`Unexpected Error: ${error}`)
            }
        })

        sideBar.addEventListener("click", (e) => {
            e.stopImmediatePropagation();
        })
    }
})