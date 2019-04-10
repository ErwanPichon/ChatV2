document.addEventListener("DOMContentLoaded", () => {

    document.querySelector('#option').style.display = "none"
    document.querySelector('#container').style.display = "none"
    document.querySelector('#loader').style.display = "none"

    let email = document.querySelector('#email'),
        password = document.querySelector('#password'),
        transformObj = (obj) => {
            let qs = ''

            for (key in obj) {
                qs += key + '=' + obj[key] + '&'
            }
            return qs.substr(0, qs.length - 1)
        },
        redAlert = (element) => {
            setTimeout(() => {
                element.style.border = "1px solid red"
            }, 100)
            setTimeout(() => {
                element.style.border = "1px solid white"
            }, 200)
            setTimeout(() => {
                element.style.border = "1px solid red"
            }, 300)
            setTimeout(() => {
                element.style.border = "1px solid white"
            }, 400)
            setTimeout(() => {
                element.style.border = "1px solid red"
            }, 500)
            setTimeout(() => {
                element.style.border = "1px solid white"
            }, 600)
        },
        formatDate = (d) => {
            return `${d.toLocaleTimeString('fr-FR')}` + " - " + `${d.toLocaleDateString('fr-FR')}`
        },
        getToken = (body, nickname, name) => {

            fetch("http://edu2.shareyourtime.fr/apijsv2/auth", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: transformObj(body)
            }).then((res) => {

                if (res.status == 200) {

                    localStorage.setItem('nickname', nickname[0])

                    res.json().then((json) => {
                        let token = json.data.token

                        localStorage.setItem('token', token)
                    })

                    document.querySelector('h1').style.display = "none"
                    document.querySelector('#connected').style.display = "none"

                    swal("Welcome!", name[0], {
                            icon: "success"
                        })
                        .then((click) => {
                            if (click) {
                                email.value = ""
                                password.value = ""
                                location.reload()
                            }
                        })

                } else {
                    redAlert(email)
                    redAlert(password)
                }

            })

        }
    createMessage = (data, i) => {
        let nicknames = data[i].nickname,
            timeCreation = new Date(data[i].created_at),
            messages = data[i].message,
            id = data[i].id,
            newNickname = nicknames.match(/([^.]+)/)

        if (newNickname[0] == "server" && newNickname[1] == "server") {
            newNickname[0] = "emir"
            newNickname[1] = "emir"
        }

        let ul = document.querySelector('#contentChat'),
            li = document.createElement('li'),
            div = document.createElement('div'),
            h2 = document.createElement('h2'),
            p = document.createElement('p'),
            p2 = document.createElement('p'),
            name = newNickname[0]

        if (nicknames == localStorage.getItem('nickname')) {
            li.className = "me"
        } else {
            li.className = "other"
        }

        p.className = "messages"
        p2.className = "timeCreation"
        li.setAttribute('name', name)

        h2.appendChild(document.createTextNode(name))
        p.appendChild(document.createTextNode(messages))
        p2.appendChild(document.createTextNode(formatDate(timeCreation)))

        ul.appendChild(li)
        li.appendChild(h2)
        li.appendChild(div)
        div.appendChild(p)
        div.appendChild(p2)

        if (localStorage.getItem(nicknames) == '') {
            localStorage.setItem(nicknames, '#' + (Math.random() * 0xFFFFFF << 0).toString(16))
        }

        h2.style.color = localStorage.getItem(nicknames)

        document.querySelector('#contentChat').scrollTop = document.querySelector('#contentChat').scrollHeight

        localStorage.setItem('lastId', id)
    }

    document.querySelector('#connect').addEventListener('click', () => {

        let emailV = email.value,
            body = {
                email: emailV,
                password: password.value
            },
            nickname = emailV.match(/([^@]+)/),
            name = emailV.match(/([^.]+)/)

        getToken(body, nickname, name, (token) => {

        })

    })

    let token = localStorage.getItem('token')

    if (token) {


        document.querySelector('#connected').style.display = "none"
        document.querySelector('h1').style.display = "none"
        document.querySelector('#loader').style.display = "block"

        setTimeout(() => {
            document.querySelector('#loader').style.display = "none"
            document.querySelector('h1').style.display = "block"
            document.querySelector('header').style.width = "95%"
            document.querySelector('header').style.height = "10%"
            document.querySelector('h1').style.fontSize = "3em"
            document.body.style.justifyContent = "normal"
            document.querySelector('#option').style.display = "block"
            document.querySelector('#container').style.display = "flex"
        }, 2500);

    }

    document.querySelector('#disconnect').addEventListener('click', () => {

        swal({
                title: "Are you sure?",
                icon: "warning",
                buttons: true,
                dangerMode: true
            })
            .then((willDelete) => {
                if (willDelete) {
                    localStorage.removeItem("token")
                    document.querySelector('#option').style.display = "none"
                    document.querySelector('header').style.display = "none"
                    document.querySelector('#container').style.display = "none"
                    swal("You have been disconnected!", {
                            icon: "success"
                        })
                        .then((click) => {
                            if (click) {
                                location.reload()
                            }
                        })
                } else {
                    swal("You still connected!")
                }
            })

    })

    localStorage.setItem('lastId', -1)

    setInterval(() => {

        let lastId = localStorage.getItem('lastId')

        fetch("http://edu2.shareyourtime.fr/apijsv2/messages", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + token
            }
        }).then((res) => {
            res.json().then((json) => {

                let data = json['data']

                if (lastId == -1) {
                    for (let i = data.length - 1; i >= 0; i--) {
                        createMessage(data, i)

                    }
                } else if (lastId != data[0].id) {
                    for (let j = data.length - 1; j >= 0; j--) {
                        const element = data[j].id

                        if (lastId == element) {
                            for (let i = j - 1; i >= 0; i--) {
                                createMessage(data, i)
                            }

                            break
                        }
                    }
                }

            })
        })
        document.querySelector('#contentChat').scrollTop = document.querySelector('#contentChat').scrollHeight

    }, 500);

    document.querySelector('#message').addEventListener('keypress', (e) => {

        let message = document.querySelector('#message'),
            body = {
                message: message.value + '        '
            }

        if (e.keyCode === 13) {

            fetch("http://edu2.shareyourtime.fr/apijsv2/messages", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + token
                },
                body: transformObj(body)
            })
            message.value = ""

        }

    })

    document.querySelector('#send').addEventListener('click', () => {

        let message = document.querySelector('#message'),
            body = {
                message: message.value + '        '
            }

        fetch("http://edu2.shareyourtime.fr/apijsv2/messages", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + token
            },
            body: transformObj(body)
        })
        message.value = ""

    })

    document.querySelector('#filter').addEventListener('click', () => {
        document.querySelector('#option').style.display = "none"
        document.querySelector('#container').style.display = "none"
        document.querySelector('header').style.display = "none"
    })

    document.querySelector('#ok').addEventListener('click', () => {
        document.querySelector('#option').style.display = "block"
        document.querySelector('#container').style.display = "flex"
        document.querySelector('header').style.display = "flex"
        document.querySelector('#contentChat').scrollTop = document.querySelector('#contentChat').scrollHeight
    })

})