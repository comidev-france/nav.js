/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   hook.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mafaussu <mafaussu@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 13:00:00 by mafaussu          #+#    #+#             */
/*   Updated: 2022/06/30 18:42:21 by mafaussu         ###   ########lyon.fr   */
/*                                                                            */
/* ************************************************************************** */

console.log("nav::init");

const nav_state_time_key = '__tsd_nav_creation';
const nav_url_key = '__tsd_nav_url';

let nav_prev_position;
let nav_direction;
let nav_position;
let nav_history;

function init_nav()
{
    nav_direction = "initial page";
    nav_position = 0;
    nav_history = [/*{
        url: document.location.href,
        state: {
            [nav_state_time_key]: new Date().getTime()
        }
    }*/
    ];
}

init_nav();

function log_nav_position(nav_position, nav_history, nav_direction) {
    console.log("nav::position=" + nav_position + "/" + nav_history.length + " direction=" + nav_direction);
    console.log("nav::----------")
}

function log_nav_history()
{
    log_nav_position(nav_position, nav_history, nav_direction);
    for (const k in nav_history)
        console.log("nav::history[" + k + "]=" + nav_history[k].url + " (" + nav_history[k].state[nav_state_time_key] + ")");
}

window.addEventListener('nav::tick', function(e) {
    console.log("nav::location=" + document.location);
    log_nav_position(e.detail.nav_position, e.detail.nav_history, e.detail.nav_direction);
})



function nav_dispatch(e = null) {
    state = {};
    if (nav_position)
        nav_history[nav_position - 1].state;
    window.dispatchEvent(new CustomEvent('nav::tick', {detail: {
            nav_prev_position: nav_prev_position,
            nav_position: nav_position,
            nav_history: nav_history,
            nav_state: state,
            nav_direction: nav_direction,
            popstate_event: e
    }, cancelable: true}));
}

function nav_dispatch_before(type, args, state = null) {
    if (!type || !args)
        throw new Error("Invalid args!!");
    console.log("NAV::DISPATCH_BEFORE", type, state);
    return window.dispatchEvent(new CustomEvent('nav::beforeTick', {detail: {
            nav_prev_position: nav_prev_position,
            nav_position: nav_position,
            nav_history: nav_history,
            nav_state: state,
            nav_direction: nav_direction,
            type: type,
            args: args
        }, cancelable: true}));
}

nav_dispatch();

function is_nav_forward_possible()
{
    return (nav_history.length > 1 && nav_position < nav_history.length);
}

function is_nav_backward_possible()
{
    return ((nav_position > 1) ||
        ((nav_position === 1) && (nav_history.length < window.history.length)));
}


window.addEventListener("popstate", function(e) {
    console.log('nav::onPopState 42');
    if (!nav_dispatch_before("popstate", [], e.state))
    {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        return false;
    }
    nav_prev_position = nav_position;
    nav_position = 0;
    if (typeof e.state == 'undefined'
        || e.state == null
        || typeof e.state[nav_state_time_key] == 'undefined'
        || e.state[nav_state_time_key] == null)
        nav_position = 1;
    else
    {
        let k = nav_history.length - 1;
        while (k >= 0)
        {
            if (nav_history[k].url === document.location.href
                && nav_history[k].state[nav_state_time_key] === e.state[nav_state_time_key])
            {
                nav_position = Number(k) + 1;
                break;
            }
            k -= 1
        }
    }
    if (nav_position < 1)
    {
        console.log("nav::warning=sync failed, url was not found in the history stack.",
            "url=" + document.location.href, ' creation=',
            e.state ? e.state[nav_state_time_key] : '');
        nav_position = nav_history.length;
        nav_direction = "redirection";
        nav_dispatch(e);
    }
    else
    {
        nav_direction = nav_position < nav_prev_position ? 'backward' : 'forward';
        nav_dispatch(e);
    }
});

function init_hooks()
{
    window.history.pushState = hook(window.history.pushState, function (cb, ...args){
        console.log('nav::pushState(...)');
        if (args.length < 2 || typeof args[0] !== 'object'
            || args[2] === window.location.pathname
        )
            return cb(args);
        args[0][nav_state_time_key] = new Date().getTime()
        args[0][nav_url_key] = args[2];
        if (!nav_dispatch_before("pushState", args))
            return false;
        const value = cb(args);
        nav_history.push({url: document.location.href, state: args[0]});
        nav_position = nav_history.length;
        nav_direction = "forward";
        nav_dispatch();
        return (value);
    });

    window.history.replaceState = hook(window.history.replaceState, function (cb, ...args) {
        console.log('nav::replaceState(...)');
        //throw new Error("ERRRR");
        if (!nav_dispatch_before("replaceState", args) && !args[0].force) {
            console.log("FAILED SAVED == 0");
            return false;
        }
        if (args.length < 2 || typeof args[0] !== 'object'
            || args[2] === window.location.pathname)
            return cb(args);
        args[0][nav_state_time_key] = new Date().getTime()
        args[0][nav_url_key] = args[2];

        nav_history[nav_position - 1] = {url: args[2], state: args[0]};
        const value = cb(args);
        nav_direction = "redirection";
        nav_dispatch();
        return (value);
    });

    window.history.go = hook(window.history.go, function (cb, ...args) {
        console.log('nav::go(...)', args);
        if (!nav_dispatch_before("go", args))
            return false;
        nav_prev_position = nav_position;

        const value = cb(args);
        if (args.length < 1 || isNaN(args[0]))
            return value;
        args[0] = Math.round(args[0]);
        if (args[0] === 0)
            return value;
        console.log("cur:", nav_position);
        if ((nav_position + args[0] >= 1)
            ||
            (nav_position + args[0] <= nav_history.length))
            nav_position += args[0];
        nav_direction = args[0] < 0 ? "backward" : "forward";
        nav_dispatch();
        console.log("new:", nav_position);
        return (value);
    });

}

init_hooks();