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
        req.flash("error", "O servidor da PokeApi demorou muito para responder ou o resultado não foi achado, tente novamente");
        res.redirect("/dashboard");
    });
});

//Get all game_version for the user
catchRouter.get("/game_version", authMiddleware.isLoggedIn, function(req, res){
    P.getVersionGroupsList()
    .then(function(response){
        res.render("catch/game_version", {game_versions: response.results});
    })
    .catch(function(err){
        if (err) {
            console.log(err);
            req.flash("error", "O servidor da PokeApi demorou muito para responder ou o resultado não foi achado, tente novamente");
            res.redirect("/dashboard");
        }
    })
});

//Get pokedexes associated with a specific game_version
catchRouter.get("/:game_version", authMiddleware.isLoggedIn, function(req, res){
    P.getVersionGroupByName  (req.params.game_version)
    .then(function(response) {
        res.render("catch/pokedex", {pokedexes: response.pokedexes, game_version: req.params.game_version});
    })
    .catch(function(error) {
        console.log('There was an ERROR: ', error);
        req.flash("error", "O servidor da PokeApi demorou muito para responder ou o resultado não foi achado, tente novamente");
        res.redirect("/dashboard");
    });
});

//Get all pokemons associated with a specific pokedex and filter if user had already captured it
catchRouter.get("/:game_version/:pokedex_name", authMiddleware.isLoggedIn, function(req, res){
    P.getPokedexByName(req.params.pokedex_name)
    .then(function(response) {
        res.render("catch/pokemons", {pokemons: response.pokemon_entries, userPokemonsNames: req.user.catchedPokemonsNames});
    })
    .catch(function(error) {
        console.log('There was an ERROR: ', error);
        req.flash("error", "O servidor da PokeApi demorou muito para responder ou o resultado não foi achado, tente novamente");
        res.redirect("/dashboard");      
    });
});

//Catch pokemon (insert on db)
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