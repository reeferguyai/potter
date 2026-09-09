"use strict";

const GanjaGrootApp = (() => {
    const VERSION = "1.0.0";

    const CONFIG = {
        apiBaseUrl: window.__APP_CONFIG__?.apiBaseUrl || "/api/v1",
        websocketUrl: window.__APP_CONFIG__?.websocketUrl || null,
        environment: window.__APP_CONFIG__?.environment || "production",
        csrfHeader: "X-CSRF-Token",
        requestTimeout: 30000,
        retryAttempts: 4,
        debug: window.__APP_CONFIG__?.debug || false
    };


    const ENV = {
        isBrowser: typeof window !== "undefined",
        isMobile: /Android|iPhone|iPad/i.test(navigator.userAgent),
        supportsWebSocket: "WebSocket" in window,
        supportsSpeech:
            "SpeechRecognition" in window ||
            "webkitSpeechRecognition" in window,
        supportsSpeechSynthesis:
            "speechSynthesis" in window,
        supportsServiceWorker:
            "serviceWorker" in navigator,
        online: navigator.onLine
    };


    const FLAGS = {
        aiStreaming: true,
        voice: true,
        ar: true,
        vr: true,
        ghostCommerce: true,
        deliveryTracking: true,
        analytics: true,
        offlineMode: true
    };


    const STATE = {
        app: {
            initialized: false,
            ready: false,
            version: VERSION,
            errors: []
        },

        auth: {
            authenticated: false,
            user: null,
            token: null,
            sessionExpires: null
        },

        user: {
            profile: null,
            preferences: {},
            permissions: []
        },

        chat:

        {
            activeConversation: null,
            conversations: [],
            messages: [],
            streaming: false,
            generating: false
        },


        memory: {
            enabled: true,
            items: []
        },


        search: {
            query: "",
            results: [],
            loading: false
        },


        uploads: {
            active: [],
            progress: {}
        },


        ui: {
            theme: "system",
            sidebar: true,
            modal: null,
            loading: false
        },


        websocket: {
            connected: false,
            reconnecting: false,
            lastHeartbeat: null
        },


        network: {
            online: navigator.onLine
        }
    };



    const Storage = {

        prefix: "ganjagroot:",


        set(key, value) {
            try {
                localStorage.setItem(
                    this.prefix + key,
                    JSON.stringify(value)
                );
            } catch {}
        },


        get(key, fallback = null) {
            try {
                const value =
                    localStorage.getItem(
                        this.prefix + key
                    );

                return value
                    ? JSON.parse(value)
                    : fallback;

            } catch {
                return fallback;
            }
        },


        remove(key) {
            try {
                localStorage.removeItem(
                    this.prefix + key
                );
            } catch {}
        },


        clear() {
            Object.keys(localStorage)
                .filter(k =>
                    k.startsWith(this.prefix)
                )
                .forEach(k =>
                    localStorage.removeItem(k)
                );
        }
    };



    const EventBus = {

        events: {},


        on(name, callback) {

            if (!this.events[name]) {
                this.events[name] = [];
            }

            this.events[name].push(callback);
        },


        off(name, callback) {

            if (!this.events[name]) return;

            this.events[name] =
                this.events[name]
                .filter(
                    fn => fn !== callback
                );
        },


        emit(name, payload = {}) {

            if (!this.events[name]) return;

            this.events[name]
                .forEach(fn => {

                    try {
                        fn(payload);
                    } catch(error) {
                        Logger.error(error);
                    }

                });
        }
    };



    const Logger = {

        info(...args) {

            if(CONFIG.debug)
                console.info(
                    "[GanjaGroot]",
                    ...args
                );
        },


        warn(...args) {

            console.warn(
                "[GanjaGroot]",
                ...args
            );

        },


        error(...args) {

            console.error(
                "[GanjaGroot]",
                ...args
            );

            STATE.app.errors.push({
                time: Date.now(),
                error:
                args.map(
                    x => String(x)
                )
            });

            EventBus.emit(
                "error",
                args
            );
        }
    };



    const DOM = {


        id(id) {
            return document.getElementById(id);
        },


        qs(selector, parent=document) {
            return parent.querySelector(selector);
        },


        qsa(selector,parent=document) {
            return [
                ...parent.querySelectorAll(selector)
            ];
        },


        create(tag, attrs={}) {

            const el =
                document.createElement(tag);


            Object.entries(attrs)
            .forEach(([key,value])=>{

                if(key==="text")
                    el.textContent=value;

                else if(key==="html")
                    el.innerHTML=value;

                else
                    el.setAttribute(
                        key,
                        value
                    );

            });


            return el;
        },


        sanitize(text="") {

            const div =
                document.createElement(
                    "div"
                );

            div.textContent=text;

            return div.innerHTML;
        },


        remove(el){

            if(el?.parentNode)
                el.parentNode.removeChild(el);

        }
    };



    const API = {


        async request(
            endpoint,
            options={}
        ){

            const controller =
                new AbortController();


            const timeout =
                setTimeout(
                    () =>
                    controller.abort(),
                    CONFIG.requestTimeout
                );


            const headers = {

                "Content-Type":
                "application/json",

                ...(options.headers || {})

            };


            const csrf =
                Storage.get("csrf");


            if(csrf)
                headers[
                    CONFIG.csrfHeader
                ] = csrf;



            if(STATE.auth.token){

                headers.Authorization =
                    `Bearer ${STATE.auth.token}`;

            }


            let attempt=0;


            while(attempt < CONFIG.retryAttempts){

                try {

                    const response =
                        await fetch(
                            CONFIG.apiBaseUrl +
                            endpoint,
                            {
                                ...options,
                                headers,
                                signal:
                                controller.signal
                            }
                        );


                    clearTimeout(timeout);


                    if(response.status===401){

                        Auth.expire();

                        throw new Error(
                            "Unauthorized"
                        );
                    }


                    const data =
                        await response.json()
                        .catch(()=>({}));


                    if(!response.ok){

                        throw {
                            status:
                            response.status,
                            data
                        };

                    }


                    return data;


                } catch(error){

                    attempt++;

                    if(
                        attempt >=
                        CONFIG.retryAttempts
                    )
                    {
                        clearTimeout(timeout);
                        throw error;
                    }


                    await new Promise(
                        r =>
                        setTimeout(
                            r,
                            500 * attempt
                        )
                    );
                }
            }
        },


        get(url){

            return this.request(
                url,
                {
                    method:"GET"
                }
            );

        },


        post(url,data){

            return this.request(
                url,
                {
                    method:"POST",
                    body:
                    JSON.stringify(data)
                }
            );

        },


        put(url,data){

            return this.request(
                url,
                {
                    method:"PUT",
                    body:
                    JSON.stringify(data)
                }
            );

        },


        patch(url,data){

            return this.request(
                url,
                {
                    method:"PATCH",
                    body:
                    JSON.stringify(data)
                }
            );

        },


        delete(url){

            return this.request(
                url,
                {
                    method:"DELETE"
                }
            );

        }
    };



    const Auth = {


        async restore(){

            const session =
                Storage.get(
                    "session"
                );


            if(!session)
                return false;


            STATE.auth =
                {
                    ...STATE.auth,
                    ...session
                };


            EventBus.emit(
                "auth:restored"
            );


            return true;

        },


        async login(credentials){

            const result =
                await API.post(
                    "/auth/login",
                    credentials
                );


            STATE.auth =
                {
                    ...STATE.auth,
                    ...result
                };


            Storage.set(
                "session",
                STATE.auth
            );


            EventBus.emit(
                "auth:login",
                STATE.auth
            );


            return result;
        },


        async logout(){

            try {

                await API.post(
                    "/auth/logout",
                    {}
                );

            }catch{}


            STATE.auth =
            {
                authenticated:false,
                user:null,
                token:null
            };


            Storage.remove(
                "session"
            );


            EventBus.emit(
                "auth:logout"
            );

        },


        expire(){

            this.logout();

            EventBus.emit(
                "auth:expired"
            );

        }
    };



    return {

        VERSION,

        CONFIG,

        ENV,

        FLAGS,

        STATE,

        Storage,

        EventBus,

        Logger,

        DOM,

        API,

        Auth

    };


})();


window.GanjaGrootApp =
    GanjaGrootApp;
const GanjaGrootRealtime = (() => {


    const WS = {

        socket:null,

        reconnectAttempts:0,

        maxReconnectAttempts:10,

        heartbeat:null,


        connect(){

            if(!GanjaGrootApp.ENV.supportsWebSocket)
                return;


            if(!GanjaGrootApp.CONFIG.websocketUrl)
                return;


            this.socket =
                new WebSocket(
                    GanjaGrootApp.CONFIG.websocketUrl
                );


            this.socket.onopen = () => {

                GanjaGrootApp.STATE.websocket.connected=true;

                this.reconnectAttempts=0;

                this.startHeartbeat();


                GanjaGrootApp.EventBus.emit(
                    "ws:connected"
                );

            };


            this.socket.onmessage = event => {

                this.handleMessage(
                    event.data
                );

            };


            this.socket.onerror = error => {

                GanjaGrootApp.Logger.error(
                    error
                );

                GanjaGrootApp.EventBus.emit(
                    "ws:error",
                    error
                );

            };


            this.socket.onclose = () => {

                GanjaGrootApp.STATE.websocket.connected=false;

                this.stopHeartbeat();


                GanjaGrootApp.EventBus.emit(
                    "ws:closed"
                );


                this.reconnect();

            };

        },


        reconnect(){

            if(
                this.reconnectAttempts >=
                this.maxReconnectAttempts
            )
                return;


            this.reconnectAttempts++;


            setTimeout(
                ()=>this.connect(),
                1000 *
                this.reconnectAttempts
            );

        },


        send(type,payload={}){

            if(
                !this.socket ||
                this.socket.readyState !== WebSocket.OPEN
            )
                return false;


            this.socket.send(
                JSON.stringify({
                    type,
                    payload,
                    timestamp:
                    Date.now()
                })
            );


            return true;

        },


        handleMessage(raw){

            let message;


            try{

                message =
                    JSON.parse(raw);

            }catch{

                return;

            }


            GanjaGrootApp.EventBus.emit(
                "ws:event",
                message
            );


            if(message.type==="ai.token"){

                AI.Stream.receive(
                    message.payload
                );

            }


            if(message.type==="notification"){

                Notifications.push(
                    message.payload
                );

            }


            if(message.type==="delivery.update"){

                GanjaGrootApp.EventBus.emit(
                    "delivery:update",
                    message.payload
                );

            }

        },


        startHeartbeat(){

            this.stopHeartbeat();


            this.heartbeat =
                setInterval(()=>{

                    this.send(
                        "heartbeat"
                    );


                    GanjaGrootApp.STATE.websocket.lastHeartbeat =
                        Date.now();


                },15000);

        },


        stopHeartbeat(){

            if(this.heartbeat)
                clearInterval(
                    this.heartbeat
                );

        },


        close(){

            this.stopHeartbeat();

            if(this.socket)
                this.socket.close();

        }

    };




    const AI = {


        activeGeneration:null,


        Stream:{


            buffer:"",

            target:null,


            start(target){

                this.buffer="";

                this.target=target;

                GanjaGrootApp.STATE.chat.streaming=true;

            },


            receive(chunk){

                this.buffer +=
                    chunk.text || "";


                if(this.target){

                    this.target.textContent =
                        this.buffer;

                }


                GanjaGrootApp.EventBus.emit(
                    "ai:token",
                    chunk
                );

            },


            finish(){

                GanjaGrootApp.STATE.chat.streaming=false;


                GanjaGrootApp.EventBus.emit(
                    "ai:complete",
                    this.buffer
                );


                this.buffer="";

            },


            cancel(){

                WS.send(
                    "ai.cancel"
                );


                this.buffer="";

                GanjaGrootApp.STATE.chat.streaming=false;

            }

        },



        async chat(message,options={}){


            const conversation =
                GanjaGrootApp.STATE.chat
                .activeConversation;



            const payload={

                message,

                conversation,

                context:
                GanjaGrootApp.STATE.memory.items,

                options

            };


            GanjaGrootApp.STATE.chat.generating=true;



            try{


                return await
                GanjaGrootApp.API.post(
                    "/ai/chat",
                    payload
                );


            }finally{


                GanjaGrootApp.STATE.chat.generating=false;


            }


        },


        regenerate(id){

            return GanjaGrootApp.API.post(
                "/ai/regenerate",
                {
                    messageId:id
                }
            );

        },


        feedback(id,value){

            return GanjaGrootApp.API.post(
                "/ai/feedback",
                {
                    messageId:id,
                    rating:value
                }
            );

        }

    };





    const Conversations = {


        async load(){

            const data =
                await GanjaGrootApp.API.get(
                    "/chat/conversations"
                );


            GanjaGrootApp.STATE.chat.conversations =
                data.items || [];


            return data;

        },



        async create(){

            const data =
                await GanjaGrootApp.API.post(
                    "/chat/conversations",
                    {}
                );


            GanjaGrootApp.STATE.chat.activeConversation =
                data.id;


            return data;

        },



        async rename(id,name){

            return GanjaGrootApp.API.patch(
                `/chat/conversations/${id}`,
                {
                    name
                }
            );

        },



        async archive(id){

            return GanjaGrootApp.API.post(
                `/chat/conversations/${id}/archive`,
                {}
            );

        },


        async remove(id){

            return GanjaGrootApp.API.delete(
                `/chat/conversations/${id}`
            );

        },


        async messages(id,page=1){

            return GanjaGrootApp.API.get(
                `/chat/conversations/${id}/messages?page=${page}`
            );

        }

    };






    const Memory = {


        async load(){

            if(
                !GanjaGrootApp.STATE.memory.enabled
            )
                return;


            const result =
                await GanjaGrootApp.API.get(
                    "/memory"
                );


            GanjaGrootApp.STATE.memory.items =
                result.items || [];


        },



        async add(item){

            const result =
                await GanjaGrootApp.API.post(
                    "/memory",
                    {
                        item
                    }
                );


            GanjaGrootApp.STATE.memory.items
                .push(result);


            return result;

        },



        async remove(id){

            await GanjaGrootApp.API.delete(
                `/memory/${id}`
            );


            GanjaGrootApp.STATE.memory.items =
                GanjaGrootApp.STATE.memory.items
                .filter(
                    x=>x.id!==id
                );

        },


        toggle(enabled){

            GanjaGrootApp.STATE.memory.enabled =
                enabled;


            GanjaGrootApp.Storage.set(
                "memory_enabled",
                enabled
            );

        }

    };







    const Knowledge = {


        categories:[

            "cannabis",
            "cultivation",
            "terpenes",
            "cannabinoids",
            "products",
            "science",
            "legal",
            "business",
            "technology"

        ],



        async search(query,filters={}){


            return GanjaGrootApp.API.post(
                "/knowledge/search",
                {
                    query,
                    filters
                }
            );


        },



        async category(name){

            return GanjaGrootApp.API.get(
                `/knowledge/category/${name}`
            );

        },


        sources(results){

            return results.map(
                item=>({

                    title:item.title,

                    url:item.source,

                    citation:item.citation

                })
            );

        }

    };







    const Search = {


        timer:null,


        query(value,callback){


            clearTimeout(
                this.timer
            );


            this.timer =
                setTimeout(async()=>{


                    const result =
                        await GanjaGrootApp.API.get(
                            `/search?q=${encodeURIComponent(value)}`
                        );


                    GanjaGrootApp.STATE.search.results =
                        result.items || [];


                    if(callback)
                        callback(result);



                },400);

        }

    };






    const Notifications = {


        items:[],


        push(notification){


            this.items.unshift(
                {
                    ...notification,
                    read:false,
                    time:Date.now()
                }
            );


            GanjaGrootApp.EventBus.emit(
                "notification:new",
                notification
            );


        },


        markRead(index){

            if(this.items[index])
                this.items[index].read=true;

        }


    };







    return {

        WS,

        AI,

        Conversations,

        Memory,

        Knowledge,

        Search,

        Notifications

    };


})();



window.GanjaGrootRealtime =
    GanjaGrootRealtime;
const GanjaGrootCommerce = (() => {


    const Voice = {


        recognition:null,

        synthesis:
            window.speechSynthesis,


        active:false,


        init(){

            const SpeechRecognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;


            if(!SpeechRecognition)
                return false;


            this.recognition =
                new SpeechRecognition();


            this.recognition.continuous=false;

            this.recognition.interimResults=true;

            this.recognition.lang="en-US";


            this.recognition.onstart=()=>{

                this.active=true;

                GanjaGrootApp.EventBus.emit(
                    "voice:start"
                );

            };


            this.recognition.onresult=e=>{


                let text="";


                for(
                    let i=e.resultIndex;
                    i<e.results.length;
                    i++
                ){

                    text +=
                    e.results[i][0].transcript;

                }


                GanjaGrootApp.EventBus.emit(
                    "voice:text",
                    {
                        text
                    }
                );


            };


            this.recognition.onerror=e=>{

                GanjaGrootApp.EventBus.emit(
                    "voice:error",
                    e
                );

            };


            this.recognition.onend=()=>{

                this.active=false;

                GanjaGrootApp.EventBus.emit(
                    "voice:end"
                );

            };


            return true;

        },



        start(){

            if(this.recognition)
                this.recognition.start();

        },


        stop(){

            if(this.recognition)
                this.recognition.stop();

        },



        speak(text,options={}){


            if(!this.synthesis)
                return;


            const utterance =
                new SpeechSynthesisUtterance(
                    text
                );


            utterance.rate =
                options.rate || 1;


            utterance.pitch =
                options.pitch || 1;


            if(options.voice)
                utterance.voice =
                    options.voice;


            this.synthesis.speak(
                utterance
            );

        },


        stopSpeaking(){

            if(this.synthesis)
                this.synthesis.cancel();

        }


    };






    const Files = {


        allowedTypes:[

            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "application/pdf"

        ],


        maxSize:
            100 * 1024 * 1024,



        validate(file){

            return (

                this.allowedTypes
                .includes(file.type)

                &&

                file.size <=
                this.maxSize

            );

        },



        preview(file){

            return URL.createObjectURL(
                file
            );

        },



        async upload(file,onProgress){


            if(!this.validate(file))
                throw new Error(
                    "Invalid file"
                );



            const form =
                new FormData();


            form.append(
                "file",
                file
            );



            const response =
                await fetch(
                    GanjaGrootApp.CONFIG.apiBaseUrl +
                    "/files/upload",
                    {

                        method:"POST",

                        headers:
                        STATE.auth?.token ?
                        {
                            Authorization:
                            `Bearer ${STATE.auth.token}`
                        }
                        :
                        {},

                        body:form

                    }
                );



            return response.json();


        }


    };







    const AR = {


        initialized:false,


        scene:null,


        init(){


            if(
                !window.isSecureContext
            )
                return false;



            this.initialized=true;


            GanjaGrootApp.EventBus.emit(
                "ar:ready"
            );


            return true;

        },



        loadObject(asset){


            return GanjaGrootApp.API.post(
                "/ar/assets/load",
                {
                    asset
                }
            );

        },



        place(object,position){


            return {

                object,

                position,

                timestamp:
                Date.now()

            };

        }


    };







    const VR = {


        initialized:false,


        init(){


            if(
                !navigator.xr
            )
                return false;


            this.initialized=true;


            GanjaGrootApp.EventBus.emit(
                "vr:ready"
            );


            return true;


        },



        enterExperience(id){


            return GanjaGrootApp.API.post(
                "/vr/session",
                {
                    experience:id
                }
            );

        }


    };







    const ThreeDPrint = {


        async createDesign(data){


            return GanjaGrootApp.API.post(
                "/3dpod/designs",
                data
            );

        },



        async quote(design){


            return GanjaGrootApp.API.post(
                "/3dpod/quote",
                {
                    design
                }
            );

        },



        async order(design,customer){


            return GanjaGrootApp.API.post(
                "/3dpod/order",
                {
                    design,
                    customer
                }
            );

        }


    };







    const PrintOnDemand = {


        async products(filters={}){


            return GanjaGrootApp.API.post(
                "/pod/products",
                filters
            );

        },



        async createListing(product){


            return GanjaGrootApp.API.post(
                "/pod/listings",
                product
            );

        },



        async fulfill(order){


            return GanjaGrootApp.API.post(
                "/pod/fulfillment",
                {
                    order
                }
            );

        }


    };







    const GhostCommerce = {


        async discoverProducts(criteria){


            return GanjaGrootApp.API.post(
                "/commerce/discover",
                criteria
            );

        },



        async validate(product){


            return GanjaGrootApp.API.post(
                "/commerce/validate",
                {
                    product
                }
            );

        },



        async optimizeListing(product){


            return GanjaGrootApp.API.post(
                "/commerce/listing/optimize",
                {
                    product
                }
            );

        },



        async createOrder(order){


            return GanjaGrootApp.API.post(
                "/commerce/order",
                order
            );

        }


    };







    const Procurement = {


        async source(order){


            return GanjaGrootApp.API.post(
                "/procurement/source",
                {
                    order
                }
            );

        },



        async compareSuppliers(product){


            return GanjaGrootApp.API.post(
                "/procurement/suppliers",
                {
                    product
                }
            );

        },



        async purchase(selection){


            return GanjaGrootApp.API.post(
                "/procurement/purchase",
                selection
            );

        }


    };







    const Dropshipping = {


        async route(order){


            return GanjaGrootApp.API.post(
                "/dropshipping/route",
                {
                    order
                }
            );

        },



        async track(shipment){


            return GanjaGrootApp.API.get(
                `/dropshipping/tracking/${shipment}`
            );

        }


    };







    const Delivery = {


        async create(delivery){


            return GanjaGrootApp.API.post(
                "/delivery/create",
                delivery
            );

        },



        async track(id){


            return GanjaGrootApp.API.get(
                `/delivery/${id}`
            );

        },



        async updateLocation(data){


            return GanjaGrootApp.API.post(
                "/delivery/location",
                data
            );

        },


        async optimizeRoute(stops){


            return GanjaGrootApp.API.post(
                "/delivery/route",
                {
                    stops
                }
            );

        }


    };







    const Booking = {


        async availability(service,date){


            return GanjaGrootApp.API.post(
                "/booking/availability",
                {
                    service,
                    date
                }
            );

        },



        async reserve(data){


            return GanjaGrootApp.API.post(
                "/booking/reserve",
                data
            );

        },



        async cancel(id){


            return GanjaGrootApp.API.post(
                `/booking/${id}/cancel`,
                {}
            );

        }


    };







    return {

        Voice,

        Files,

        AR,

        VR,

        ThreeDPrint,

        PrintOnDemand,

        GhostCommerce,

        Procurement,

        Dropshipping,

        Delivery,

        Booking

    };


})();



window.GanjaGrootCommerce =
    GanjaGrootCommerce;
const GanjaGrootInfrastructure = (() => {


    const UI = {


        components:{},


        register(name,component){

            this.components[name]=component;

        },


        mount(name,target,props={}){


            const component =
                this.components[name];


            if(!component)
                return;


            const node =
                component(props);


            if(target)
                target.appendChild(node);


            return node;

        },



        modal:{


            open(content){


                const modal =
                    document.createElement(
                        "div"
                    );


                modal.className =
                    "gg-modal";


                modal.innerHTML =
                    content;


                document.body.appendChild(
                    modal
                );


                GanjaGrootApp.STATE.ui.modal =
                    modal;


            },


            close(){


                const modal =
                    GanjaGrootApp.STATE.ui.modal;


                if(modal)
                    modal.remove();


                GanjaGrootApp.STATE.ui.modal=null;

            }

        },



        toast(message,type="info"){


            const toast =
                document.createElement(
                    "div"
                );


            toast.className =
                `gg-toast ${type}`;


            toast.textContent =
                message;


            document.body.appendChild(
                toast
            );


            setTimeout(
                ()=>toast.remove(),
                4000
            );

        }


    };







    const Theme = {


        current:"system",



        apply(theme){


            this.current=theme;


            document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );


            GanjaGrootApp.Storage.set(
                "theme",
                theme
            );


        },



        init(){


            this.apply(

                GanjaGrootApp.Storage.get(
                    "theme",
                    "system"
                )

            );

        }


    };







    const Accessibility = {


        reducedMotion:false,



        init(){


            this.reducedMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;


            document
            .querySelectorAll(
                "[data-focus]"
            )
            .forEach(el=>{

                el.tabIndex=0;

            });


        },



        announce(message){


            let region =
                document.getElementById(
                    "gg-live-region"
                );


            if(!region){


                region =
                document.createElement(
                    "div"
                );


                region.id =
                    "gg-live-region";


                region.setAttribute(
                    "aria-live",
                    "polite"
                );


                document.body.appendChild(
                    region
                );


            }


            region.textContent =
                message;


        },


        trapFocus(element){


            const focusable =
                element.querySelectorAll(
                    "button,input,textarea,a,select"
                );


            if(focusable.length)
                focusable[0].focus();


        }


    };







    const Security = {


        validateInput(value){


            if(
                typeof value !==
                "string"
            )
                return false;


            return !(
                /<script|javascript:|onerror=/i
                .test(value)
            );

        },



        sanitize(value){


            return GanjaGrootApp.DOM
                .sanitize(value);

        },



        externalLink(url){


            try{


                const parsed =
                    new URL(url);


                return [
                    "https:",
                    "http:"
                ]
                .includes(
                    parsed.protocol
                );


            }catch{

                return false;

            }

        },



        clearSession(){


            GanjaGrootApp.Storage
                .clear();


        }


    };







    const Analytics = {


        enabled:true,


        queue:[],



        track(event,data={}){


            if(!this.enabled)
                return;



            const payload={

                event,

                data,

                timestamp:
                Date.now()

            };


            this.queue.push(
                payload
            );


            this.flush();

        },



        async flush(){


            if(!this.queue.length)
                return;


            const events =
                [
                    ...this.queue
                ];


            this.queue=[];


            try{


                await GanjaGrootApp.API.post(
                    "/analytics/events",
                    {
                        events
                    }
                );


            }catch{

                this.queue.push(
                    ...events
                );

            }


        }


    };







    const SEO = {


        title(value){

            document.title =
                value;


        },



        meta(name,value){


            let tag =
                document.querySelector(
                    `meta[name="${name}"]`
                );


            if(!tag){


                tag =
                document.createElement(
                    "meta"
                );


                tag.name=name;


                document.head.appendChild(
                    tag
                );

            }


            tag.content=value;


        },



        canonical(url){


            let link =
                document.querySelector(
                    "link[rel=canonical]"
                );


            if(!link){


                link =
                document.createElement(
                    "link"
                );


                link.rel="canonical";


                document.head.appendChild(
                    link
                );

            }


            link.href=url;


        },



        structured(data){


            const script =
                document.createElement(
                    "script"
                );


            script.type =
                "application/ld+json";


            script.textContent =
                JSON.stringify(
                    data
                );


            document.head.appendChild(
                script
            );


        }


    };







    const Performance = {


        cache:new Map(),



        preload(url){


            const link =
                document.createElement(
                    "link"
                );


            link.rel="preload";


            link.href=url;


            document.head.appendChild(
                link
            );

        },



        remember(key,value){

            this.cache.set(
                key,
                value
            );

        },



        recall(key){

            return this.cache.get(
                key
            );

        },


        lazy(selector){


            const items =
                document.querySelectorAll(
                    selector
                );


            const observer =
                new IntersectionObserver(
                    entries=>{


                        entries.forEach(
                            entry=>{


                                if(entry.isIntersecting){


                                    entry.target
                                    .load?.();


                                    observer.unobserve(
                                        entry.target
                                    );


                                }


                            }
                        );


                    }
                );



            items.forEach(
                item=>
                observer.observe(item)
            );


        }


    };







    const Offline = {


        online:
            navigator.onLine,



        init(){


            window.addEventListener(
                "online",
                ()=>{


                    this.online=true;


                    GanjaGrootApp.EventBus.emit(
                        "network:online"
                    );


                }
            );



            window.addEventListener(
                "offline",
                ()=>{


                    this.online=false;


                    GanjaGrootApp.EventBus.emit(
                        "network:offline"
                    );


                }
            );


        }



    };







    const Diagnostics = {


        report(){


            return {


                version:
                GanjaGrootApp.VERSION,


                browser:
                navigator.userAgent,


                memory:
                performance.memory || null,


                network:
                GanjaGrootApp.STATE.network,


                websocket:
                GanjaGrootApp.STATE.websocket



            };


        },



        error(error){


            GanjaGrootApp.Logger.error(
                error
            );


            Analytics.track(
                "client_error",
                {
                    message:
                    error.message
                }
            );


        }


    };







    const Testing = {


        enabled:
        location.search.includes(
            "test=true"
        ),



        simulateError(){


            throw new Error(
                "Simulation"
            );

        },



        mock(name,data){


            if(!this.enabled)
                return;


            window[
                `mock_${name}`
            ]=data;


        }


    };







    const Bootstrap = {


        async start(){


            try{


                Theme.init();


                Accessibility.init();


                Offline.init();


                await
                GanjaGrootApp.Auth.restore();



                if(
                    GanjaGrootAppRealtime
                )
                {

                    GanjaGrootRealtime.WS.connect();

                    await
                    GanjaGrootRealtime.Memory.load();

                }



                GanjaGrootApp.STATE.app.initialized=true;

                GanjaGrootApp.STATE.app.ready=true;



                GanjaGrootApp.EventBus.emit(
                    "app:ready"
                );


            }catch(error){


                Diagnostics.error(
                    error
                );


            }


        }


    };







    return {


        UI,

        Theme,

        Accessibility,

        Security,

        Analytics,

        SEO,

        Performance,

        Offline,

        Diagnostics,

        Testing,

        Bootstrap


    };



})();



window.GanjaGrootInfrastructure =
    GanjaGrootInfrastructure;





document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        GanjaGrootInfrastructure
        .Bootstrap
        .start();

    }
);
