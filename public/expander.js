function expand(id) {
  var e = document.getElementById(id);
  if (e.style.visibility == 'collapse') {
    e.style.visibility = 'visible';  
  }
  else {
    e.style.visibility = 'collapse';
  }
}