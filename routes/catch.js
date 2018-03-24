const express = require("express");
const catchRouter = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middleware/authentication");

//Package to request to pokemon api (auto-caching)
const pokedex = require("pokedex-promise-v2");
const P = new pokedex();

//Show specific pokemon info (route order matters!)
catchRouter.get("/pokemon/:pokemon_name", authMiddleware.isLoggedIn, function(req, res){
    var pokemonName = req.params.pokemon_name;
    P.getPokemonByName(pokemonName)
    .then(function(response) {
        res.render("catch/show_pokemon", {pokemonData: response});
    })
    .catch(function(error) {
        console.log('There was an ERROR: ', error);
        req.flash("error", "O servidor da PokeApi demorou muito para responder");
        res.redirect("/dashboard");
    });
});

//Get all regions for the user
catchRouter.get("/region", authMiddleware.isLoggedIn, function(req, res){
    P.getRegionsList()
    .then(function(response){
        res.render("catch/region", {regions: response.results});
    })
    .catch(function(err){
        if (err) {
            console.log(err);
            req.flash("error", "O servidor da PokeApi demorou muito para responder");
            res.redirect("/dashboard");
        }
    })
});

//Get pokedexes associated with a specific region
catchRouter.get("/:region_name", authMiddleware.isLoggedIn, function(req, res){
    P.getRegionByName (req.params.region_name)
    .then(function(response) {
        res.render("catch/pokedex", {pokedexes: response.pokedexes, region: req.params.region_name});
    })
    .catch(function(error) {
        console.log('There was an ERROR: ', error);
        req.flash("error", "O servidor da PokeApi demorou muito para responder");
        res.redirect("/dashboard");
    });
});

//Get all pokemons associated with a specific pokedex and filter if user had already captured it
catchRouter.get("/:region_name/:pokedex_name", authMiddleware.isLoggedIn, function(req, res){
    P.getPokedexByName(req.params.pokedex_name)
    .then(function(response) {
        res.render("catch/pokemons", {pokemons: response.pokemon_entries, userPokemonsNames: req.user.catchedPokemonsNames});
    })
    .catch(function(error) {
        console.log('There was an ERROR: ', error);
        req.flash("error", "O servidor da PokeApi demorou muito para responder");
        res.redirect("/dashboard");      
    });
});

//Catch pokemon (insert)
catchRouter.post("/", authMiddleware.isLoggedIn, function(req, res){
    User.findById(req.user._id, function(err, foundUser){
        if (err) {
            console.log("Error inserting pokemon" + err);
            req.flash("error", err);
            res.redirect("/dashboard");
        } else {
            var pokemonName = req.body.pokemon_name;    
            if (foundUser.catchedPokemonsNames.indexOf(pokemonName) === -1){
                foundUser.catchedPokemonsNames.push(pokemonName);
                foundUser.save();
                return res.redirect("/dashboard");
            }
            res.redirect("/dashboard");
        }
    });
});

module.exports = catchRouter;