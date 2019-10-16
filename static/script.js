$(document).ready(function () {

    $(".modalBtn").click(function () {
        $("#galaga-modal").fadeIn('slow');
    });

    $(".siteModal").click(function () {
        $("#site-modal").fadeIn('slow');
    });

    $(".close").click(function () {
        $(this).closest(".modal").fadeOut('slow');
    });

    

    //Fixes bug causing particles.js to not display properly
    setTimeout(function(){ 
        window.dispatchEvent(new Event('resize'));
     }, 50);

     ScrollReveal().reveal(".skillcontainer", {delay: 500});
     ScrollReveal().reveal(".timecontainer", {delay: 500});
     ScrollReveal().reveal(".project-container", {delay: 1000});
     ScrollReveal().reveal("#grid1", {delay: 1200});
     ScrollReveal().reveal("#grid2", {delay: 1600});
});