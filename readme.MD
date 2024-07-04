# Voting Management Project

This project implements an Election Management System using Node.js, Express.js, MongoDB, and JWT for authentication. It includes functionalities for managing candidates, user registration, login, profile management, and voting operations.

## Table of Contents

* Features
* Prerequisites
* Installation
* Usage
* API Routes
* Contributing
* License

## Features

* User authentication using JWT tokens
* Admin and voter role management
* Candidate CRUD operations (Create, Read, Update, Delete)
* User registration and login
* User profile management (including password update)
* Voting mechanism with constraints (e.g., one vote per user)

## Prerequisites
Before running this project, make sure you have the following installed:

* Node.js (with npm)
* MongoDB (running locally or on a cloud service)
* Git (optional, for cloning the repository)

## Installation

* Clone a repository 
   * git clone https://github.com/aryansourceCode/voting.git
* Navigate to the project directory
* Install dependencies:
    * npm install
* Set environment variables:Create a .env file in the project root and define the following variables:
    * PORT=4000
    * MONGODB_URI=mongodb:mongodb://localhost:27017/voting
    * JWT_SECRET=12345
* Start the server:
    * npm start
# API Routes


