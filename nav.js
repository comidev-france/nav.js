/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   hook.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mafaussu <mafaussu@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 13:00:00 by mafaussu          #+#    #+#             */
/*   Updated: 2022/06/30 13:42:21 by mafaussu         ###   ########lyon.fr   */
/*                                                                           */
/* ************************************************************************** */

console.log("nav::init");

let nav_position = 1;
let nav_history = [document.location.href];

function log_nav_position()
{
    console.log("nav::position=" + nav_position + "/" + nav_history.length);
}

log_nav_position();

window.history.pushState = hook(window.history.pushState, function (cb, ...args) {
    console.log('nav::pushState(...)');
    console.log(args);
    const value = cb(args);
    nav_history.push(document.location.href);
    nav_position = nav_history.length;
    log_nav_position();
    return (value);
});

window.history.replaceState = hook(window.history.replaceState, function (cb, ...args) {
    console.log('nav::history.replaceState(...)');
    const value = cb(args);
    nav_history.splice(0, 1);
    log_nav_position();
    return (value);
});

window.history.go = hook(window.history.go, function (cb, ...args) {
    console.log('nav::go');
    if (nav_position - args[0] >= 0)
        nav_position -= args[0];
    else if (nav_position + args[0] <= nav_history.length)
        nav_position += args[0];
    const value = cb(args);
    log_nav_position();
    return (value);
});

window.addEventListener("popstate", function(e) {
    console.log("nav::location=" + document.location);
    for (const k in nav_history)
        if (nav_history[k] === document.location.href)
            nav_position = Number(k) + 1;
    log_nav_position();
});

function log_nav_history()
{
    for (const k in nav_history)
        console.log("nav::history[" + k + "]=" + nav_history[k]);
}

function is_nav_forward_possible()
{
    return (nav_position > 1);
}

function is_nav_backward_possible()
{
    return (nav_position < nav_history.length);
}
 
