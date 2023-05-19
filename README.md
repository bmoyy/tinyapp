# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of URLs page"](https://github.com/bmoyy/tinyapp/blob/master/docs/urls-page.PNG)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## How to use TinyApp

#### Register/Login
Users must register an account to use TinyApps features. Users can register through `localhost:8080/register`. Enter a valid email and password and you're set to use TinyApp!

#### Create New Links
Click on Create New URL on the left side of the header and fill in the submission form. Upon completion, you will be given a shortened URL which will direct you to your submitted site.

#### Edit or Delete Short URLS
You can edit or delete short URLs from the main page `localhost:8080/urls`. Each list of short URLs are unique to each user!
