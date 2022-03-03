let cities = []

const API_URL = "https://tranquil-wildwood-28247.herokuapp.com"
// const API_URL = "http://localhost:8000"

let TOKEN = localStorage.getItem('TOKEN') || ''

const DEFAULT_COORDS = {lat: 55.752, lon: 37.615}

const veretifyCity = (name) => {
    if (name == '') return false
    return /^[a-zA-Zа-яА-я \-]+$/.test(name)
}

const delErrorCity = (element) => {
    element.parentElement.parentElement.remove()
}

const reloadErrorCity = (element, name, checkRepeats, callback) => {
    addCity(name, checkRepeats, callback, element.parentElement.parentElement)
}

const creteError = (name, checkRepeats, callback) => {
    let delButton = document.createElement('button')
    delButton.setAttribute('class', 'circle-button')
    delButton.append(createElement('img', {src: '/static/images/del.svg'}))
    delButton.addEventListener('click', function () {
        this.parentElement.parentElement.parentElement.remove()
        cities.remove(name)
    })

    let reloadButton = createElement('button', {class: 'circle-button'}, createElement('img', {src: '/static/images/reload.svg'}))

    reloadButton.addEventListener('click', function() {
        addCity(name, checkRepeats, callback, this.parentElement.parentElement.parentElement)
    })

    let errorBlock = createElement(
        'li',
        {class: 'col-item error-load'},
        createElement(
            'div',
            {class: 'header'},
            createElement('h3', null, name),
            createElement(
                'div',
                null, 
                reloadButton,
                delButton
            )
        ),
        createElement(
            'img',
            {src: '/static/images/error.svg'}
        )
    )

    return errorBlock
}

const createMiniLoader = (id) => {
    let loader = createElement('li', {class: 'col-item mini-loader', id: id}, 
        createElement('span', null, 'Загрузка'),
        createElement('img', {src: '/static/images/loader.svg'})
    )
    return loader
} 

const createLoader = (id = 'cur-weather-loader') => {
    let loader = createElement('li', {class: 'loader', id: id}, 
        createElement('span', null, 'Загрузка'),
        createElement('img', {src: '/static/images/loader.svg'})
    )
    return loader
}

const loadData = (data) => {
    return new Promise((resolve, reject) => {
        if(data.name) {
            fetch(`${API_URL}/current/city?city=${data.name}`, {headers: {'TOKEN': TOKEN}})
                .then(res => {
                    if(res.headers.get('TOKEN')) {
                        TOKEN = res.headers.get('TOKEN')
                        localStorage.setItem('TOKEN', res.headers.get('TOKEN'))
                    }
                    return res.json()
                })
                .then(data => resolve(data))
                .catch(err => reject(err))
        } else {
            if(data.coord) {
            fetch(`${API_URL}/current/coord?lat=${data.coord.lat}&lon=${data.coord.lon}`, {headers: {'TOKEN': TOKEN}})
                .then(res => {
                    if(res.headers.get('TOKEN')) {
                        TOKEN = res.headers.get('TOKEN')
                        localStorage.setItem('TOKEN', res.headers.get('TOKEN'))
                    }
                    return res.json()
                })
                .then(data => resolve(data))
                .catch(err => reject(err))
            } else {
                reject('Invalid data')
            }
        }
    })
}

const parseApiRequest = (data) => {
    let result = {
        city: data.city_name,
        img: `https://www.weatherbit.io/static/img/icons/${data.weather.icon}.png`,
        params: [
            {name: 'Ветер', value: `${data.wind_spd.toFixed(1)} м/с, ${data.wind_cdir_full}`},
            {name: 'Облачность', value: `${data.clouds.toFixed(1)} %`},
            {name: 'Давление', value: `${data.pres.toFixed(1)} мб`},
            {name: 'Влажность', value: `${data.rh.toFixed(1)} %`},
            {name: 'Координаты', value: `[${data.lat.toFixed(3)}, ${data.lon.toFixed(3)}]`},
        ],
        temp: `${data.temp.toFixed(1)} °C`,
    }
    return result
}

cities.add = (function() {
    return function() {
        // console.log(arguments)
        arguments[0] = arguments[0].toString().toLowerCase()
        let name = arguments[0] 
        let args = arguments

        if(!veretifyCity(name)) {
            alert('Неправильное имя городв')
            return
        }

        addCity(name, (name) => this.indexOf(name) !== -1, (name) => {
            args[0] = name
            Array.prototype.push.apply(this, args)
            fetch(`${API_URL}/favs/set?cities=${JSON.stringify(this)}`, {headers: {'TOKEN': TOKEN}})
                .then(res => {})
                .catch(e => console.error('Error save fav list', e))
            // localStorage.setItem('CITIES_LIST', JSON.stringify(this))
        })
    }
})()

cities.remove = (function() {
    return function() {
        arguments[1].disabed = true
        console.log(arguments)
        // let f = arguments[1]
        let name = arguments[0].toString()
        name = name.toLowerCase()

        // alert(name)

        let index = this.indexOf(name)

        // console.log(index)

        if(index !== -1) {
            let array = [...this]
            array.splice(index, 1)
            console.log(array)
            fetch(`${API_URL}/favs/set?cities=${JSON.stringify(array)}`, {headers: {'TOKEN': TOKEN}})
                .then(res => {
                    arguments[1].disabed = false
                    console.log('aaaaaaaaaa', res)
                    if(res.status === 200) {
                        this.splice(index, 1)
                        arguments[1].parentElement.parentElement.remove()
                    } else {
                        console.error('Ошибка')
                    }
                    if(res.headers.get('TOKEN')) {
                        TOKEN = res.headers.get('TOKEN')
                        localStorage.setItem('TOKEN', res.headers.get('TOKEN'))
                    }
                })
                .catch(e => console.error('Error save fav list', e))
            //localStorage.setItem('CITIES_LIST', JSON.stringify(this))
        }
    }
})()

const createCity = (data) => {
    let params = data.params.map(el => createElement(
        'li',
        null,
        createElement('span', {class: 'name'}, el.name),
        createElement('span', {class: 'value'}, el.value)
    ))


    let delButton = createElement(
        'button',
        {class: 'circle-button'},
        createElement('img', {src: '/static/images/del.svg'})
    )
    delButton.addEventListener('click', function() {
        cities.remove(data.city.toLowerCase(), this)
    })

    let city = createElement(
        'li',
        {class: 'col-item city-card'},
        createElement(
            'div',
            {class: 'header-weather'},
            createElement('h3', null, `${data.city}`),
            createElement('span', null, `${data.temp}`),
            createElement('img', {src: data.img}),
            delButton
        ),
        createElement(
            'ul',
            {class: 'weather'},
            ...params
        )
    )

    return city
}

const addCity = (name, checkRepeats, callback, errorCard = null) => {
    if(errorCard) {
        document.getElementById('city-favs').replaceChild(createMiniLoader(`load-city-${name}`), errorCard)
    } else {
        document.getElementById('city-favs').append(createMiniLoader(`load-city-${name}`))
    }
    let loader = document.getElementById(`load-city-${name}`)

    loadData({name: name, coord: null})
        .then(data => {
            // console.log(data)
            if(checkRepeats && checkRepeats(data.city.toLowerCase())) {
                alert('Город уже есть в списке избранных')
                document.getElementById(`load-city-${name}`).remove()
                return
            }
            let city = createCity(data)
            
            document.getElementById('city-favs').replaceChild(city, loader)
            if(callback) callback(data.city.toLowerCase())
        })
        .catch(err => {
            document.getElementById('city-favs').replaceChild(creteError(name, checkRepeats, callback), loader)
            console.error(err)
            // new Audio('/static/error.mp3').play()
        })
}

function createElement() {
    // console.log(arguments)
    let element = document.createElement(arguments[0])
    if(arguments[1]) {
        Object.keys(arguments[1]).forEach(attr => {
            element.setAttribute(attr, arguments[1][attr])
        })       
    }

    for(let i = 2; i < arguments.length; i++) {
        if(typeof arguments[i] === 'function') {
            element.append(arguments[i]())
        } else {
            element.append(arguments[i])
        }
    }

    return element
}

const renderCurrentWeather = (coords) => {
    let section = document.getElementById('cur-weather')
    section.innerHTML = ''
    section.append(createLoader())

    loadData({name: null, coord: coords})
        .then(data => {
            document.title = data.city
            let params = data.params.map(el => createElement(
                'li',
                null,
                createElement('span', {class: 'name'}, el.name),
                createElement('span', {class: 'value'}, el.value)
            ))

            let curWeather = createElement(
                'div',
                {class: 'flex-cols'},
                createElement(
                    'div',
                    {class: 'col-item'},
                    createElement('h2', null, data.city),
                    createElement(
                        'div',
                        {class: 'flex-row'},
                        createElement('img', {src: data.img}),
                        createElement('span', null, data.temp)
                    )
                ),
                createElement(
                    'div',
                    {class: 'col-item cur-weather-metrics'},
                    createElement(
                        'ul',
                        {class: 'weather'},
                        ...params
                    )
                )
            )

            section.replaceChild(curWeather, document.getElementById('cur-weather-loader'))
        })
        .catch(err => {
            document.getElementById('cur-weather-loader').innerHTML = '<img heigh="100px" src="/static/images/error.svg"/>'
            console.error(err)
            // new Audio('/static/error.mp3').play()
        })
}

const loadCurrentWeather = () => {
    if(!navigator.geolocation) {
        alert('Геолокация отключена')
        renderCurrentWeather(DEFAULT_COORDS)
    } else {
        navigator.geolocation.getCurrentPosition(
            (location) => {
                renderCurrentWeather({lat: location.coords.latitude, lon: location.coords.longitude})
            },
            () => {
                alert('Нет доступа к вашей геопозиции. Использую позицию по умолчанию')
                renderCurrentWeather(DEFAULT_COORDS)
            }
        )
    }
}

loadCurrentWeather()

document.getElementById('new-city').addEventListener('submit', function(e) {
    e.preventDefault()

    let name = document.getElementById('city-name').value 

    cities.add(name)

    document.getElementById('city-name').value = ''

    return false
})

document.getElementById('reload-button').addEventListener('click', loadCurrentWeather)

fetch(`${API_URL}/favs/get`, {headers: {'TOKEN': TOKEN}})
    .then(res => {
        if(res.headers.get('TOKEN')) {
            TOKEN = res.headers.get('TOKEN')
            localStorage.setItem('TOKEN', res.headers.get('TOKEN'))
        }
        return res.json()
    })
    .then(data => {
        data.forEach(city => {
            cities.push(city)
            addCity(city)
        })
    })
    .catch(e => console.error('Error get fav list', e))

