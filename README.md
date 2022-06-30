# nav.js

requires [hook.js](https://github.com/comidev-france/hook.js/blob/main/hook.js)

## usage :

- detect browser back and forward button pressed in any js app that relies on popstate / pushstate 

```
window.addEventListener('nav::user_asked_history', function(e) {
    console.log(e);
    console.log('nav::direction=', e.detail.direction);
})

```

- show / hide your in-app back and forward buttons using :

```
is_nav_forward_possible()
is_nav_backward_possible()

```

- navigate around user history using 

```
let nav_position;
let nav_history; 
```

