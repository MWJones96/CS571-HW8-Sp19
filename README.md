# CS571 Homework 8: eBay Product Search (AngularJS and Node.js)

A responsive single-page application for searching eBay listings, with item details, product photos, similar items and a wish list, backed by a small Express proxy server.

## Overview

Coursework for USC CSCI 571, Web Technologies, Spring 2019. The front end is an AngularJS 1.4 application styled with Bootstrap 4 and Angular Material. The Node.js server serves the static files and exposes JSON endpoints that call eBay, Google Custom Search and GeoNames on the client's behalf, so that API credentials stay on the server.

The same back end is used by the Android client in [CS571-HW9-Sp19](https://github.com/MWJones96/CS571-HW9-Sp19).

## Features

- **Search form** with keyword, category, condition (New, Used, Unspecified), shipping options (Local Pickup, Free Shipping), distance in miles (10 by default) and a choice of the current location or another ZIP code. The current ZIP code is looked up from the visitor's IP address via ip-api.com.
- **Validation**: the search button stays disabled until the keyword is non-blank and a five-digit ZIP code is available, with inline error messages.
- **ZIP code autocomplete** using Angular Material's `md-autocomplete`, backed by the GeoNames postal code search (up to five US suggestions).
- **Results** (up to 50 items) in a striped table paginated at 10 per page, with image, truncated title (full title in a tooltip), price, shipping, ZIP code, seller and a wish-list toggle. A **Details** button returns to the last selected item.
- **Item details** in five tabs:
  - **Product**: images, subtitle, price, location, return policy and item specifics.
  - **Photos**: up to eight images from Google Custom Search for the item title.
  - **Shipping**: cost, locations, handling time, expedited and one-day shipping, returns.
  - **Seller**: feedback score, popularity as a circular progress indicator, feedback star, top-rated status and store link.
  - **Similar Items**: up to 20 items from the eBay Merchandising API, sortable by name, days left, price or shipping cost (ascending or descending), with a **Show More** / **Show Less** toggle.
- **Wish list** stored in the browser's `localStorage`, with a running total cost.
- **Share to Facebook** via the Facebook share dialogue.
- Progress bar while loading and fade/zoom animations between views.

## Tech stack

- **Front end**: AngularJS 1.4.8 (with ngAnimate, ngAria, ngMessages), Angular Material 1.0, angular-svg-round-progressbar, Bootstrap 4.3, jQuery 3.3, Material Icons. All are loaded from CDNs.
- **Back end**: Node.js, Express and `request`.
- **APIs**: eBay Finding (`findItemsAdvanced`), Shopping (`GetSingleItem`) and Merchandising (`getSimilarItems`); Google Custom Search JSON API (image search); GeoNames postal code search; ip-api.com.

## Getting started

### Prerequisites

- Node.js and npm.
- Credentials for the third-party APIs:
  - an eBay developer application ID;
  - a Google API key with the Custom Search JSON API enabled, and a Programmable Search Engine ID configured for image search;
  - a GeoNames username.

### Configuration

The credentials are constants near the top of `server.js` (`APP_ID`, `API_KEY_GOOGLE`, `SEARCH_ENGINE_ID` and `GeonamesUsername`). Replace them with your own values before running the server.

### Install and run

The repository has no `package.json` (it is listed in `.gitignore` alongside `node_modules/`), so install the two server dependencies directly:

```sh
npm install express request
node server.js
```

The server listens on port 8080. Open `http://localhost:8080/`.

## Server endpoints

| Route | Query parameters | Upstream call |
|-------|------------------|---------------|
| `GET /json` | `Keyword`, `Category`, `ConditionNew`, `ConditionUsed`, `ConditionUnspec`, `LocalPickup`, `FreeShipping`, `Distance`, `Here`, `Zip`, `UserLocZip` | eBay Finding API, 50 results; returns the item array |
| `GET /jsonItem` | `ItemID` | eBay Shopping API `GetSingleItem`; returns the `Item` object |
| `GET /googleImg` | `SearchTerm` | Google Custom Search image search, 8 results |
| `GET /similarItems` | `Item` | eBay Merchandising API `getSimilarItems`, 20 results |
| `GET /zipComplete` | `Zip` | GeoNames postal code prefix search |

## Project structure

```
server.js       Express server: static files and API proxy endpoints
index.html      Page markup and AngularJS templates
angularApp.js   AngularJS module and controller (search, pagination, wish list)
styles.css      Custom styles and view animations
```

## Status and limitations

- eBay has since retired its legacy Finding, Shopping and Merchandising APIs, so searches are unlikely to work without porting the server to eBay's current REST APIs.
- The `request` package is deprecated, though it can still be installed.
- The IP geolocation lookup is a synchronous request to `http://ip-api.com/json` over plain HTTP, which browsers block on HTTPS pages.
- Facebook share and seller icons are hot-linked from `http://csci571.com/hw/hw8/`, the course website.
- There are no automated tests.

## Acknowledgements

- USC CSCI 571, Web Technologies, for the assignment specification and image assets.
- eBay developer APIs, Google Custom Search, GeoNames and ip-api.com.
