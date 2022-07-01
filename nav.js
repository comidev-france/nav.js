/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   hook.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mafaussu <mafaussu@student.42lyon.fr>      +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 13:00:00 by mafaussu          #+#    #+#             */
/*   Updated: 2022/06/30 18:42:21 by mafaussu         ###   ########lyon.fr   */
/*                                                                            */
/* ************************************************************************** */

console.log("nav::init");

let nav_position;
let nav_history;

function init_nav()
{
    nav_position = 1;
    nav_history = [{url: document.location.href, creation: new Date().getTime()}];
}

init_nav();

function log_nav_position() {
    console.log("nav::position=" + nav_position + "/" + nav_history.length);
}

function log_nav_history()
{
    log_nav_position();
    for (const k in nav_history)
        console.log("nav::history[" + k + "]=" + nav_history[k].url + " (" + nav_history[k].creation + ")");
}

log_nav_history();

function is_nav_forward_possible()
{
    return (nav_history.length > 1 && nav_position < nav_history.length);
}

function is_nav_backward_possible()
{
    return ((nav_position > 1) ||
        ((nav_position === 1) && (nav_history.length < window.history.length)));
}

window.history.forward = hook(window.history.forward, function() {
    console.log('nav::forward');
})

window.history.pushState = hook(window.history.pushState, function (cb, ...args){
    console.log('nav::pushState(...)');
    console.log(args);
    if (args.length < 2 || typeof args[0] !== 'object')
        return cb(args);
    args[0].__nav_creation = new Date().getTime()
    const value = cb(args);
    nav_history.push({url: document.location.href, creation: args[0].__nav_creation});
    nav_position = nav_history.length;
    log_nav_position();
    return (value);
});

window.history.replaceState = hook(window.history.replaceState, function (cb, ...args) {
    console.log('nav::replaceState(...)');
    const value = cb(args);
    nav_history.splice(0, 1);
    log_nav_position();
    return (value);
});

window.history.go = hook(window.history.go, function (cb, ...args) {
    console.log('nav::go(...)', args);
    const value = cb(args);
    if (args.length && args[0] !== 0)
    {
        if ((nav_position + args[0] >= 1)
            ||
            (nav_position + args[0] <= nav_history.length))
            nav_position += args[0];
    }
    return (value);
});

window.addEventListener("popstate", function(e) {
    console.log("nav::location=" + document.location);
    console.log("nav::popstate=", e);
    const prev_nav_position = nav_position;
    nav_position = 0;
    if (typeof e.state == 'undefined'
        || e.state == null
        || typeof e.state.__nav_creation == 'undefined'
        || e.state.__nav_creation == null)
        nav_position = 1;
    else
    {
        let k = nav_history.length - 1;
        while (k >= 0)
        {
            if (nav_history[k].url === document.location.href
                && nav_history[k].creation === e.state.__nav_creation)
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
            e.state ? e.state.__nav_creation : '');
        nav_position = 1;
        log_nav_history();
    }
    else
    {
        window.dispatchEvent(new CustomEvent('nav::user_asked_history', {
            detail: {
                'prev_nav_position': prev_nav_position,
                'nav_position': nav_position,
                'direction': prev_nav_position <= nav_position ? 'forward' : 'backward',
                'pop_state_event': e
            }
        }));
        log_nav_position();
    }
});

window.addEventListener('nav::user_asked_history', function(e) {
    console.log(e);
    console.log('nav::direction=', e.detail.direction);
})
