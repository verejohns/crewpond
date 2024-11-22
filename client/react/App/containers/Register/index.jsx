import React, { Component } from "react";
import connect from 'react-redux/es/connect/connect';
import PropTypes from "prop-types";
import selectors from './selectors';
import actions from '../../actions';
import md5 from "md5";
import { Link, withRouter } from 'react-router-dom';
import { paths, functions, constant, messages } from "../../../../../utils";
import { Select } from "../../../components";

import ReCAPTCHA from 'react-google-recaptcha';
import { Checkbox } from "../../components";
import { toast } from 'react-toastify';

import PlacesAutocomplete, { geocodeByAddress,
    geocodeByPlaceId,
    getLatLng } from 'react-places-autocomplete'

const customStyles = {
    option: (provided, state) => ({
        ...provided,
        color: '#000'
      }),
    control: (base) => ({
        ...base,
        border: '1 !important',
        borderRadius: 20,
      })
}


const categories = [
    {
        "label": "AV & Production",
        "options": [
            {
                "label": "General AV",
                "value": {
                    "id": 0,
                    "content": "General AV",
                    "main": "AV & Production"
                }
            },
            {
                "label": "AV Technician",
                "value": {
                    "id": 1,
                    "content": "AV Technician",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Audio",
                "value": {
                    "id": 2,
                    "content": "Audio",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Lighting",
                "value": {
                    "id": 3,
                    "content": "Lighting",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Vision",
                "value": {
                    "id": 4,
                    "content": "Vision",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Camera Operators",
                "value": {
                    "id": 5,
                    "content": "Camera Operators",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Video Production",
                "value": {
                    "id": 6,
                    "content": "Video Production",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Technical Directors",
                "value": {
                    "id": 7,
                    "content": "Technical Directors",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Stage Hands",
                "value": {
                    "id": 8,
                    "content": "Stage Hands",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Virtual Stage Managers",
                "value": {
                    "id": 9,
                    "content": "Virtual Stage Managers",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Webcast/Video Conferencing",
                "value": {
                    "id": 10,
                    "content": "Webcast/Video Conferencing",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Production Manager",
                "value": {
                    "id": 11,
                    "content": "Production Manager",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Auto Cue/Telly Prompter",
                "value": {
                    "id": 12,
                    "content": "Auto Cue/Telly Prompter",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Camera Director",
                "value": {
                    "id": 13,
                    "content": "Camera Director",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Show Caller",
                "value": {
                    "id": 14,
                    "content": "Show Caller",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Graphics Operator",
                "value": {
                    "id": 15,
                    "content": "Graphics Operator",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Projectionist",
                "value": {
                    "id": 16,
                    "content": "Projectionist",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Camera Control Unit Operator",
                "value": {
                    "id": 17,
                    "content": "Camera Control Unit Operator",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Visual Content Creators",
                "value": {
                    "id": 18,
                    "content": "Visual Content Creators",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Theatre Technician",
                "value": {
                    "id": 19,
                    "content": "Theatre Technician",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Event Managers",
                "value": {
                    "id": 20,
                    "content": "Event Managers",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Event & Wedding Planner",
                "value": {
                    "id": 21,
                    "content": "Event & Wedding Planner",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Event Coordinator",
                "value": {
                    "id": 22,
                    "content": "Event Coordinator",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Stage Managers",
                "value": {
                    "id": 23,
                    "content": "Stage Managers",
                    "main": "AV & Production"
                }
            },
            {
                "label": "CAD Designer",
                "value": {
                    "id": 24,
                    "content": "CAD Designer",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Riggers",
                "value": {
                    "id": 25,
                    "content": "Riggers",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Loaders",
                "value": {
                    "id": 26,
                    "content": "Loaders",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Truck Drivers",
                "value": {
                    "id": 27,
                    "content": "Truck Drivers",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Forklift Drivers",
                "value": {
                    "id": 28,
                    "content": "Forklift Drivers",
                    "main": "AV & Production"
                }
            },
            {
                "label": "Photographers",
                "value": {
                    "id": 29,
                    "content": "Photographers",
                    "main": "AV & Production"
                }
            }
        ]
    },
    {
        "label": "Theme & Styling",
        "options": [
            {
                "label": "Set Designers & Builders",
                "value": {
                    "id": 0,
                    "content": "Set Designers & Builders",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Signage Designers & Installers",
                "value": {
                    "id": 1,
                    "content": "Signage Designers & Installers",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Visual Merchandisers",
                "value": {
                    "id": 2,
                    "content": "Visual Merchandisers",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Exhibit Installer",
                "value": {
                    "id": 3,
                    "content": "Exhibit Installer",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Event Designer",
                "value": {
                    "id": 4,
                    "content": "Event Designer",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Event Décor",
                "value": {
                    "id": 5,
                    "content": "Event Décor",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Theatrical Staging",
                "value": {
                    "id": 6,
                    "content": "Theatrical Staging",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Costumes Makers",
                "value": {
                    "id": 7,
                    "content": "Costumes Makers",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Props",
                "value": {
                    "id": 8,
                    "content": "Props",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Property & Event Stylists",
                "value": {
                    "id": 9,
                    "content": "Property & Event Stylists",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Themers",
                "value": {
                    "id": 10,
                    "content": "Themers",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Draping and Staging",
                "value": {
                    "id": 11,
                    "content": "Draping and Staging",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Carpeting",
                "value": {
                    "id": 12,
                    "content": "Carpeting",
                    "main": "Theme & Styling"
                }
            },
            {
                "label": "Florists & Plants",
                "value": {
                    "id": 13,
                    "content": "Florists & Plants",
                    "main": "Theme & Styling"
                }
            }
        ]
    },
    {
        "label": "Hospitality & Catering",
        "options": [
            {
                "label": "Restaurant & Café All-rounders",
                "value": {
                    "id": 0,
                    "content": "Restaurant & Café All-rounders",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Catering Staff",
                "value": {
                    "id": 1,
                    "content": "Catering Staff",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Floor Staff",
                "value": {
                    "id": 2,
                    "content": "Floor Staff",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Food and Beverage Staff",
                "value": {
                    "id": 3,
                    "content": "Food and Beverage Staff",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Host & Hostess",
                "value": {
                    "id": 4,
                    "content": "Host & Hostess",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Counter Staff & Cashiers",
                "value": {
                    "id": 5,
                    "content": "Counter Staff & Cashiers",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Food Delivery Driver",
                "value": {
                    "id": 6,
                    "content": "Food Delivery Driver",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Gaming Staff",
                "value": {
                    "id": 7,
                    "content": "Gaming Staff",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Wait Staff",
                "value": {
                    "id": 8,
                    "content": "Wait Staff",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Kitchen Staff",
                "value": {
                    "id": 9,
                    "content": "Kitchen Staff",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Dish Hand",
                "value": {
                    "id": 10,
                    "content": "Dish Hand",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Bar Staff",
                "value": {
                    "id": 11,
                    "content": "Bar Staff",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Barback",
                "value": {
                    "id": 12,
                    "content": "Barback",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Bussie",
                "value": {
                    "id": 13,
                    "content": "Bussie",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Barista",
                "value": {
                    "id": 14,
                    "content": "Barista",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Sommelier",
                "value": {
                    "id": 15,
                    "content": "Sommelier",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Sandwich Hand",
                "value": {
                    "id": 16,
                    "content": "Sandwich Hand",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Mixologists",
                "value": {
                    "id": 17,
                    "content": "Mixologists",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Cook’s",
                "value": {
                    "id": 18,
                    "content": "Cook’s",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Chef’s",
                "value": {
                    "id": 19,
                    "content": "Chef’s",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "House Keeping",
                "value": {
                    "id": 20,
                    "content": "House Keeping",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Porter",
                "value": {
                    "id": 21,
                    "content": "Porter",
                    "main": "Hospitality & Catering"
                }
            },
            {
                "label": "Valet Parking Staff",
                "value": {
                    "id": 22,
                    "content": "Valet Parking Staff",
                    "main": "Hospitality & Catering"
                }
            }
        ]
    },
    {
        "label": "Entertainment",
        "options": [
            {
                "label": "Masters of Ceremonies",
                "value": {
                    "id": 0,
                    "content": "Masters of Ceremonies",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Party Hosts",
                "value": {
                    "id": 1,
                    "content": "Party Hosts",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Models & Promo Staff",
                "value": {
                    "id": 2,
                    "content": "Models & Promo Staff",
                    "main": "Entertainment"
                }
            },
            {
                "label": "DJ’s",
                "value": {
                    "id": 3,
                    "content": "DJ’s",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Bands & Musical Groups",
                "value": {
                    "id": 4,
                    "content": "Bands & Musical Groups",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Magicians",
                "value": {
                    "id": 5,
                    "content": "Magicians",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Comedians",
                "value": {
                    "id": 6,
                    "content": "Comedians",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Circus Acts",
                "value": {
                    "id": 7,
                    "content": "Circus Acts",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Children Entertainers",
                "value": {
                    "id": 8,
                    "content": "Children Entertainers",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Dancers",
                "value": {
                    "id": 9,
                    "content": "Dancers",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Classical Musicians",
                "value": {
                    "id": 10,
                    "content": "Classical Musicians",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Soloists",
                "value": {
                    "id": 11,
                    "content": "Soloists",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Fire Performers",
                "value": {
                    "id": 12,
                    "content": "Fire Performers",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Impersonators",
                "value": {
                    "id": 13,
                    "content": "Impersonators",
                    "main": "Entertainment"
                }
            },
            {
                "label": "Acrobats",
                "value": {
                    "id": 14,
                    "content": "Acrobats",
                    "main": "Entertainment"
                }
            }
        ]
    },
    {
        "label": "Radio & Podcasts",
        "options": [
            {
                "label": "Programming Manager",
                "value": {
                    "id": 0,
                    "content": "Programming Manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Assistant Programming Manager",
                "value": {
                    "id": 1,
                    "content": "Assistant Programming Manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Music Director",
                "value": {
                    "id": 2,
                    "content": "Music Director",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Head of Podcasting/Production",
                "value": {
                    "id": 3,
                    "content": "Head of Podcasting/Production",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Executive Producer",
                "value": {
                    "id": 4,
                    "content": "Executive Producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Managing Producer",
                "value": {
                    "id": 5,
                    "content": "Managing Producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Senior Producer",
                "value": {
                    "id": 6,
                    "content": "Senior Producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Producer",
                "value": {
                    "id": 7,
                    "content": "Producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Assistant Producer",
                "value": {
                    "id": 8,
                    "content": "Assistant Producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Junior Producer",
                "value": {
                    "id": 9,
                    "content": "Junior Producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Daily producers",
                "value": {
                    "id": 10,
                    "content": "Daily producers",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Radio presenter/announcer",
                "value": {
                    "id": 11,
                    "content": "Radio presenter/announcer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Show host",
                "value": {
                    "id": 12,
                    "content": "Show host",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Reporters",
                "value": {
                    "id": 13,
                    "content": "Reporters",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Panel operator",
                "value": {
                    "id": 14,
                    "content": "Panel operator",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Audio producer",
                "value": {
                    "id": 15,
                    "content": "Audio producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Graphic designer",
                "value": {
                    "id": 16,
                    "content": "Graphic designer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Editor",
                "value": {
                    "id": 17,
                    "content": "Editor",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Sound/audio engineer",
                "value": {
                    "id": 18,
                    "content": "Sound/audio engineer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Sound designer",
                "value": {
                    "id": 19,
                    "content": "Sound designer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Digital content producer",
                "value": {
                    "id": 20,
                    "content": "Digital content producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Audience Development Manager",
                "value": {
                    "id": 21,
                    "content": "Audience Development Manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Sports manager",
                "value": {
                    "id": 22,
                    "content": "Sports manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Sales manager",
                "value": {
                    "id": 23,
                    "content": "Sales manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Account Executives",
                "value": {
                    "id": 24,
                    "content": "Account Executives",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Local Sales Reps",
                "value": {
                    "id": 25,
                    "content": "Local Sales Reps",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "National Sales Reps",
                "value": {
                    "id": 26,
                    "content": "National Sales Reps",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "News Director",
                "value": {
                    "id": 27,
                    "content": "News Director",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Chief Engineer",
                "value": {
                    "id": 28,
                    "content": "Chief Engineer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Staff Engineer",
                "value": {
                    "id": 29,
                    "content": "Staff Engineer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Maintenance Staff",
                "value": {
                    "id": 30,
                    "content": "Maintenance Staff",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Station Manager",
                "value": {
                    "id": 31,
                    "content": "Station Manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Production Manager",
                "value": {
                    "id": 32,
                    "content": "Production Manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Promotions Manager",
                "value": {
                    "id": 33,
                    "content": "Promotions Manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Street Team",
                "value": {
                    "id": 34,
                    "content": "Street Team",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Commercial Producer",
                "value": {
                    "id": 35,
                    "content": "Commercial Producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Traffic Manager",
                "value": {
                    "id": 36,
                    "content": "Traffic Manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Creative Director",
                "value": {
                    "id": 37,
                    "content": "Creative Director",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Creative manager",
                "value": {
                    "id": 38,
                    "content": "Creative manager",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Writer/Copy Writers",
                "value": {
                    "id": 39,
                    "content": "Writer/Copy Writers",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Video producer",
                "value": {
                    "id": 40,
                    "content": "Video producer",
                    "main": "Radio & Podcasts"
                }
            },
            {
                "label": "Voice Over artist",
                "value": {
                    "id": 41,
                    "content": "Voice Over artist",
                    "main": "Radio & Podcasts"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Key Creative Team",
        "options": [
            {
                "label": "Executive Producer",
                "value": {
                    "id": 0,
                    "content": "Executive Producer",
                    "main": "Film & Television - Key Creative Team"
                }
            },
            {
                "label": "Producer",
                "value": {
                    "id": 1,
                    "content": "Producer",
                    "main": "Film & Television - Key Creative Team"
                }
            },
            {
                "label": "Director",
                "value": {
                    "id": 2,
                    "content": "Director",
                    "main": "Film & Television - Key Creative Team"
                }
            },
            {
                "label": "Screenwriter",
                "value": {
                    "id": 3,
                    "content": "Screenwriter",
                    "main": "Film & Television - Key Creative Team"
                }
            },
            {
                "label": "Director/Vision Switcher",
                "value": {
                    "id": 4,
                    "content": "Director/Vision Switcher",
                    "main": "Film & Television - Key Creative Team"
                }
            },
            {
                "label": "Technical Director",
                "value": {
                    "id": 5,
                    "content": "Technical Director",
                    "main": "Film & Television - Key Creative Team"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Production Department",
        "options": [
            {
                "label": "Line producer",
                "value": {
                    "id": 0,
                    "content": "Line producer",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Production manager",
                "value": {
                    "id": 1,
                    "content": "Production manager",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Production coordinator",
                "value": {
                    "id": 2,
                    "content": "Production coordinator",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Production Secretary",
                "value": {
                    "id": 3,
                    "content": "Production Secretary",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Production accountant",
                "value": {
                    "id": 4,
                    "content": "Production accountant",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Post-production Supervisor",
                "value": {
                    "id": 5,
                    "content": "Post-production Supervisor",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "First assistant director (1st AD)",
                "value": {
                    "id": 6,
                    "content": "First assistant director (1st AD)",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Second assistant director (2nd AD)",
                "value": {
                    "id": 7,
                    "content": "Second assistant director (2nd AD)",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "The third assistant director (3rd AD)",
                "value": {
                    "id": 8,
                    "content": "The third assistant director (3rd AD)",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Production Assistant/Production Runner",
                "value": {
                    "id": 9,
                    "content": "Production Assistant/Production Runner",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Continuity/Script supervisor",
                "value": {
                    "id": 10,
                    "content": "Continuity/Script supervisor",
                    "main": "Film & Television - Production Department"
                }
            },
            {
                "label": "Stunt coordinator",
                "value": {
                    "id": 11,
                    "content": "Stunt coordinator",
                    "main": "Film & Television - Production Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Script Department",
        "options": [
            {
                "label": "Story producer",
                "value": {
                    "id": 0,
                    "content": "Story producer",
                    "main": "Film & Television - Script Department"
                }
            },
            {
                "label": "Script Editor",
                "value": {
                    "id": 1,
                    "content": "Script Editor",
                    "main": "Film & Television - Script Department"
                }
            },
            {
                "label": "Script Co-ordinator",
                "value": {
                    "id": 2,
                    "content": "Script Co-ordinator",
                    "main": "Film & Television - Script Department"
                }
            },
            {
                "label": "Auto Cue/Telly Prompter",
                "value": {
                    "id": 3,
                    "content": "Auto Cue/Telly Prompter",
                    "main": "Film & Television - Script Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Location Department",
        "options": [
            {
                "label": "Location Manager",
                "value": {
                    "id": 0,
                    "content": "Location Manager",
                    "main": "Film & Television - Location Department"
                }
            },
            {
                "label": "Location Assistant",
                "value": {
                    "id": 1,
                    "content": "Location Assistant",
                    "main": "Film & Television - Location Department"
                }
            },
            {
                "label": "Location Scout",
                "value": {
                    "id": 2,
                    "content": "Location Scout",
                    "main": "Film & Television - Location Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Camera Department",
        "options": [
            {
                "label": "Director of Photography/Cinematographer",
                "value": {
                    "id": 0,
                    "content": "Director of Photography/Cinematographer",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Camera operator",
                "value": {
                    "id": 1,
                    "content": "Camera operator",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Camera operator OB",
                "value": {
                    "id": 2,
                    "content": "Camera operator OB",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "First assistant camera (1st AC/Focus Puller)",
                "value": {
                    "id": 3,
                    "content": "First assistant camera (1st AC/Focus Puller)",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Second assistant camera (2nd AC)",
                "value": {
                    "id": 4,
                    "content": "Second assistant camera (2nd AC)",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Loader",
                "value": {
                    "id": 5,
                    "content": "Loader",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Camera Production Assistant",
                "value": {
                    "id": 6,
                    "content": "Camera Production Assistant",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Digital imaging technician",
                "value": {
                    "id": 7,
                    "content": "Digital imaging technician",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Data Wrangler",
                "value": {
                    "id": 8,
                    "content": "Data Wrangler",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "CCU Operator",
                "value": {
                    "id": 9,
                    "content": "CCU Operator",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Steadicam operator",
                "value": {
                    "id": 10,
                    "content": "Steadicam operator",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Steadicam Assistant",
                "value": {
                    "id": 11,
                    "content": "Steadicam Assistant",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Motion Control Technician/Operator",
                "value": {
                    "id": 12,
                    "content": "Motion Control Technician/Operator",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Video Split/Assist Operator",
                "value": {
                    "id": 13,
                    "content": "Video Split/Assist Operator",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Stills Photographer/EPK",
                "value": {
                    "id": 14,
                    "content": "Stills Photographer/EPK",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Drone Camera Operator",
                "value": {
                    "id": 15,
                    "content": "Drone Camera Operator",
                    "main": "Film & Television - Camera Department"
                }
            },
            {
                "label": "Underwater Camera Operator",
                "value": {
                    "id": 16,
                    "content": "Underwater Camera Operator",
                    "main": "Film & Television - Camera Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Sound Department",
        "options": [
            {
                "label": "Sound Recordist",
                "value": {
                    "id": 0,
                    "content": "Sound Recordist",
                    "main": "Film & Television - Sound Department"
                }
            },
            {
                "label": "Production sound mixer",
                "value": {
                    "id": 1,
                    "content": "Production sound mixer",
                    "main": "Film & Television - Sound Department"
                }
            },
            {
                "label": "Location Sound Assistant/Boom operator",
                "value": {
                    "id": 2,
                    "content": "Location Sound Assistant/Boom operator",
                    "main": "Film & Television - Sound Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Grip Department",
        "options": [
            {
                "label": "Key Grip",
                "value": {
                    "id": 0,
                    "content": "Key Grip",
                    "main": "Film & Television - Grip Department"
                }
            },
            {
                "label": "Best boy (grip)",
                "value": {
                    "id": 1,
                    "content": "Best boy (grip)",
                    "main": "Film & Television - Grip Department"
                }
            },
            {
                "label": "Dolly grip",
                "value": {
                    "id": 2,
                    "content": "Dolly grip",
                    "main": "Film & Television - Grip Department"
                }
            },
            {
                "label": "Grip Assistant",
                "value": {
                    "id": 3,
                    "content": "Grip Assistant",
                    "main": "Film & Television - Grip Department"
                }
            },
            {
                "label": "Rigging Grip",
                "value": {
                    "id": 4,
                    "content": "Rigging Grip",
                    "main": "Film & Television - Grip Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Electrical Department",
        "options": [
            {
                "label": "Gaffer",
                "value": {
                    "id": 0,
                    "content": "Gaffer",
                    "main": "Film & Television - Electrical Department"
                }
            },
            {
                "label": "Best boy electric",
                "value": {
                    "id": 1,
                    "content": "Best boy electric",
                    "main": "Film & Television - Electrical Department"
                }
            },
            {
                "label": "Lighting technicians",
                "value": {
                    "id": 2,
                    "content": "Lighting technicians",
                    "main": "Film & Television - Electrical Department"
                }
            },
            {
                "label": "Lighting Assistant",
                "value": {
                    "id": 3,
                    "content": "Lighting Assistant",
                    "main": "Film & Television - Electrical Department"
                }
            },
            {
                "label": "Rigging Electrician",
                "value": {
                    "id": 4,
                    "content": "Rigging Electrician",
                    "main": "Film & Television - Electrical Department"
                }
            },
            {
                "label": "Board Operator",
                "value": {
                    "id": 5,
                    "content": "Board Operator",
                    "main": "Film & Television - Electrical Department"
                }
            },
            {
                "label": "Electrician",
                "value": {
                    "id": 6,
                    "content": "Electrician",
                    "main": "Film & Television - Electrical Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Art Department",
        "options": [
            {
                "label": "Production Designer",
                "value": {
                    "id": 0,
                    "content": "Production Designer",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Art Director",
                "value": {
                    "id": 1,
                    "content": "Art Director",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Assistant Art Director",
                "value": {
                    "id": 2,
                    "content": "Assistant Art Director",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Set designer",
                "value": {
                    "id": 3,
                    "content": "Set designer",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Illustrator",
                "value": {
                    "id": 4,
                    "content": "Illustrator",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Set decorator",
                "value": {
                    "id": 5,
                    "content": "Set decorator",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Buyer",
                "value": {
                    "id": 6,
                    "content": "Buyer",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Set Dresser",
                "value": {
                    "id": 7,
                    "content": "Set Dresser",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Props Master",
                "value": {
                    "id": 8,
                    "content": "Props Master",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Standby Props",
                "value": {
                    "id": 9,
                    "content": "Standby Props",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Props Builder",
                "value": {
                    "id": 10,
                    "content": "Props Builder",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Armourer",
                "value": {
                    "id": 11,
                    "content": "Armourer",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Construction Coordinator",
                "value": {
                    "id": 12,
                    "content": "Construction Coordinator",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Construction Manager",
                "value": {
                    "id": 13,
                    "content": "Construction Manager",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Key Scenic",
                "value": {
                    "id": 14,
                    "content": "Key Scenic",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Model Maker",
                "value": {
                    "id": 15,
                    "content": "Model Maker",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Concept Artist",
                "value": {
                    "id": 16,
                    "content": "Concept Artist",
                    "main": "Film & Television - Art Department"
                }
            },
            {
                "label": "Painter",
                "value": {
                    "id": 17,
                    "content": "Painter",
                    "main": "Film & Television - Art Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Hair and Make-up Department",
        "options": [
            {
                "label": "Make-up artists",
                "value": {
                    "id": 0,
                    "content": "Make-up artists",
                    "main": "Film & Television - Hair and Make-up Department"
                }
            },
            {
                "label": "Make-up assistant",
                "value": {
                    "id": 1,
                    "content": "Make-up assistant",
                    "main": "Film & Television - Hair and Make-up Department"
                }
            },
            {
                "label": "SFX Make-up",
                "value": {
                    "id": 2,
                    "content": "SFX Make-up",
                    "main": "Film & Television - Hair and Make-up Department"
                }
            },
            {
                "label": "Hair Stylist",
                "value": {
                    "id": 3,
                    "content": "Hair Stylist",
                    "main": "Film & Television - Hair and Make-up Department"
                }
            },
            {
                "label": "Assistant Hair Stylist",
                "value": {
                    "id": 4,
                    "content": "Assistant Hair Stylist",
                    "main": "Film & Television - Hair and Make-up Department"
                }
            },
            {
                "label": "Wig Stylist",
                "value": {
                    "id": 5,
                    "content": "Wig Stylist",
                    "main": "Film & Television - Hair and Make-up Department"
                }
            },
            {
                "label": "Prosthetics",
                "value": {
                    "id": 6,
                    "content": "Prosthetics",
                    "main": "Film & Television - Hair and Make-up Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Wardrobe Department",
        "options": [
            {
                "label": "Costume designer",
                "value": {
                    "id": 0,
                    "content": "Costume designer",
                    "main": "Film & Television - Wardrobe Department"
                }
            },
            {
                "label": "Costume Supervisor",
                "value": {
                    "id": 1,
                    "content": "Costume Supervisor",
                    "main": "Film & Television - Wardrobe Department"
                }
            },
            {
                "label": "Costume Standby",
                "value": {
                    "id": 2,
                    "content": "Costume Standby",
                    "main": "Film & Television - Wardrobe Department"
                }
            },
            {
                "label": "Art Finisher",
                "value": {
                    "id": 3,
                    "content": "Art Finisher",
                    "main": "Film & Television - Wardrobe Department"
                }
            },
            {
                "label": "Buyer",
                "value": {
                    "id": 4,
                    "content": "Buyer",
                    "main": "Film & Television - Wardrobe Department"
                }
            },
            {
                "label": "Cutter/Fitter",
                "value": {
                    "id": 5,
                    "content": "Cutter/Fitter",
                    "main": "Film & Television - Wardrobe Department"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Post Production",
        "options": [
            {
                "label": "Film Editor",
                "value": {
                    "id": 0,
                    "content": "Film Editor",
                    "main": "Film & Television - Post Production"
                }
            },
            {
                "label": "Assistant Editor",
                "value": {
                    "id": 1,
                    "content": "Assistant Editor",
                    "main": "Film & Television - Post Production"
                }
            },
            {
                "label": "Online Editor",
                "value": {
                    "id": 2,
                    "content": "Online Editor",
                    "main": "Film & Television - Post Production"
                }
            },
            {
                "label": "Colourist",
                "value": {
                    "id": 3,
                    "content": "Colourist",
                    "main": "Film & Television - Post Production"
                }
            },
            {
                "label": "Negative Cutter",
                "value": {
                    "id": 4,
                    "content": "Negative Cutter",
                    "main": "Film & Television - Post Production"
                }
            },
            {
                "label": "Post Production Supervisor",
                "value": {
                    "id": 5,
                    "content": "Post Production Supervisor",
                    "main": "Film & Television - Post Production"
                }
            },
            {
                "label": "Post Production Coordinator",
                "value": {
                    "id": 6,
                    "content": "Post Production Coordinator",
                    "main": "Film & Television - Post Production"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Visual Effect(VFX)",
        "options": [
            {
                "label": "VFX Supervisor",
                "value": {
                    "id": 0,
                    "content": "VFX Supervisor",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            },
            {
                "label": "VFX Artist",
                "value": {
                    "id": 1,
                    "content": "VFX Artist",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            },
            {
                "label": "Compositor",
                "value": {
                    "id": 2,
                    "content": "Compositor",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            },
            {
                "label": "Roto/Paint Artist",
                "value": {
                    "id": 3,
                    "content": "Roto/Paint Artist",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            },
            {
                "label": "Matte Painter",
                "value": {
                    "id": 4,
                    "content": "Matte Painter",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            },
            {
                "label": "Animator",
                "value": {
                    "id": 5,
                    "content": "Animator",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            },
            {
                "label": "Motion Graphics Artist",
                "value": {
                    "id": 6,
                    "content": "Motion Graphics Artist",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            },
            {
                "label": "Previs Supervisor",
                "value": {
                    "id": 7,
                    "content": "Previs Supervisor",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            },
            {
                "label": "Previs Artist",
                "value": {
                    "id": 8,
                    "content": "Previs Artist",
                    "main": "Film & Television - Visual Effect(VFX)"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Post Production-Sound/Music",
        "options": [
            {
                "label": "Sound Designer",
                "value": {
                    "id": 0,
                    "content": "Sound Designer",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "Dialogue Editor",
                "value": {
                    "id": 1,
                    "content": "Dialogue Editor",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "Sound Editor",
                "value": {
                    "id": 2,
                    "content": "Sound Editor",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "Re-recording Mixer",
                "value": {
                    "id": 3,
                    "content": "Re-recording Mixer",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "Music Supervisor",
                "value": {
                    "id": 4,
                    "content": "Music Supervisor",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "Composer",
                "value": {
                    "id": 5,
                    "content": "Composer",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "Foley Artist",
                "value": {
                    "id": 6,
                    "content": "Foley Artist",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "Sound Edit Assistant",
                "value": {
                    "id": 7,
                    "content": "Sound Edit Assistant",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "ADR Supervisor",
                "value": {
                    "id": 8,
                    "content": "ADR Supervisor",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            },
            {
                "label": "ADR Recordist",
                "value": {
                    "id": 9,
                    "content": "ADR Recordist",
                    "main": "Film & Television - Post Production-Sound/Music"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Other Production Crew",
        "options": [
            {
                "label": "Casting Director",
                "value": {
                    "id": 0,
                    "content": "Casting Director",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Casting Assistant",
                "value": {
                    "id": 1,
                    "content": "Casting Assistant",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Storyboard Artist",
                "value": {
                    "id": 2,
                    "content": "Storyboard Artist",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Runner",
                "value": {
                    "id": 3,
                    "content": "Runner",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Caterers",
                "value": {
                    "id": 4,
                    "content": "Caterers",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Unit Manager",
                "value": {
                    "id": 5,
                    "content": "Unit Manager",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Unit Nurse",
                "value": {
                    "id": 6,
                    "content": "Unit Nurse",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Unit Publicist",
                "value": {
                    "id": 7,
                    "content": "Unit Publicist",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Stills Photographer/EPK",
                "value": {
                    "id": 8,
                    "content": "Stills Photographer/EPK",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Researcher",
                "value": {
                    "id": 9,
                    "content": "Researcher",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Transcription",
                "value": {
                    "id": 10,
                    "content": "Transcription",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Translator",
                "value": {
                    "id": 11,
                    "content": "Translator",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Graphic Designer",
                "value": {
                    "id": 12,
                    "content": "Graphic Designer",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Special Effects Technician",
                "value": {
                    "id": 13,
                    "content": "Special Effects Technician",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Driver",
                "value": {
                    "id": 14,
                    "content": "Driver",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Fixer",
                "value": {
                    "id": 15,
                    "content": "Fixer",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Floor Manager",
                "value": {
                    "id": 16,
                    "content": "Floor Manager",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Chaperone",
                "value": {
                    "id": 17,
                    "content": "Chaperone",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "EVS Operator",
                "value": {
                    "id": 18,
                    "content": "EVS Operator",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Broadcast Engineer",
                "value": {
                    "id": 19,
                    "content": "Broadcast Engineer",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Viz Operator",
                "value": {
                    "id": 20,
                    "content": "Viz Operator",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Traffic Management",
                "value": {
                    "id": 21,
                    "content": "Traffic Management",
                    "main": "Film & Television - Other Production Crew"
                }
            },
            {
                "label": "Security",
                "value": {
                    "id": 22,
                    "content": "Security",
                    "main": "Film & Television - Other Production Crew"
                }
            }
        ]
    },
    {
        "label": "Film & Television - Interactive Media",
        "options": [
            {
                "label": "Producer",
                "value": {
                    "id": 0,
                    "content": "Producer",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Designer",
                "value": {
                    "id": 1,
                    "content": "Designer",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Developer",
                "value": {
                    "id": 2,
                    "content": "Developer",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Production Assistant",
                "value": {
                    "id": 3,
                    "content": "Production Assistant",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Studio Manager",
                "value": {
                    "id": 4,
                    "content": "Studio Manager",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Project Manager",
                "value": {
                    "id": 5,
                    "content": "Project Manager",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Account Manager",
                "value": {
                    "id": 6,
                    "content": "Account Manager",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "New Business Developer",
                "value": {
                    "id": 7,
                    "content": "New Business Developer",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Content Strategist",
                "value": {
                    "id": 8,
                    "content": "Content Strategist",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Information Architect",
                "value": {
                    "id": 9,
                    "content": "Information Architect",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Web Editor",
                "value": {
                    "id": 10,
                    "content": "Web Editor",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "SEO Specialist",
                "value": {
                    "id": 11,
                    "content": "SEO Specialist",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Programmer",
                "value": {
                    "id": 12,
                    "content": "Programmer",
                    "main": "Film & Television - Interactive Media"
                }
            },
            {
                "label": "Usability Specialist",
                "value": {
                    "id": 13,
                    "content": "Usability Specialist",
                    "main": "Film & Television - Interactive Media"
                }
            }
        ]
    }
]
class Register extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            termsChecked: false,
            privacyChecked: false,
            recaptchaToken: '',
            location: null,
            categories: [],
            user_categories: [],
            submit_categories: [],
            isEdit: false,
            isOpen: false,
            jobber_type: null
        };
        this.jobberTypeOptions = [
            {label: 'Sole Trader', value: 'sole_trader'},
            {label: 'Company', value: 'company'},
            {label: 'Full Time Worker', value: 'full_time_worker'},
            {label: 'Casual Worker', value: 'casual_worker'}
        ];
        this.selectCategory = this.selectCategory.bind(this);
        this.selectJobberType = this.selectJobberType.bind(this);
    }

    componentDidMount() {

        if(this.captchaRegister) {
            this.captchaRegister.reset();
        }
    }

    verifyCallback(recaptchaToken) {
        this.setState({recaptchaToken});
    }

    subscribeWebPortal = () => {
        const stripe = Stripe(process.env.STRIPE_API_KEY);
        stripe.redirectToCheckout({
            items: [{plan: 'super_user_new', quantity: 1}],
            successUrl: 'http://localhost/app/login',
            cancelUrl:  'http://localhost/app/login',
        }).then(function (result) {
            console.log(result)
            if (result.error) {
              // If `redirectToCheckout` fails due to a browser or network
              // error, display the localized error message to your customer.
              var displayError = document.getElementById('error-message');
              displayError.textContent = result.error.message;
            }
        });
    }

    handleCheckChange = (type) => {
        if (type === 'terms') {
            this.setState({
                termsChecked: !this.state.termsChecked
            });
        } else if (type === 'privacy') {
            this.setState({
                privacyChecked: !this.state.privacyChecked
            });
        }
    };

    handlePlaceChange = (address) => {
        
        let user_location = {};

        user_location.address = address;

        this.setState({ location: user_location });
    };

    handlePlaceSelect = (address) => {
        
        let user_location = {};

        geocodeByAddress(address)
        .then(results => getLatLng(results[0]))
        .then(latLng => {

            user_location.address = address;
            user_location.place_name = address.split(" ")[0];
            user_location.latitude = latLng.lat;
            user_location.longitude = latLng.lng;

            this.setState({ location: user_location });
            
        }).catch(error => console.error('Error', error));
    };

    selectCategory(opt) {

        let new_submit_categories = [];

        opt.forEach(optItem => {
            const new_category = {main: optItem.value.main, sub: optItem.value.content, reveal: optItem.value.reveal};
            new_submit_categories.push(new_category);
        })

        this.setState({ user_categories: opt, submit_categories: new_submit_categories});
    }

    selectJobberType(item) {
        console.log(item);
        this.setState({jobber_type: item.value})
    }

    handleSubmit = (ev) => {
        ev.preventDefault();
        const { isSubmitting, register, history: { push } } = this.props;
        const { termsChecked, privacyChecked, location, user_categories, jobber_type } = this.state;

        if (isSubmitting)
            return;
    
        this.formRef.classList.add('was-validated');

        if (this.formRef.checkValidity() && jobber_type && termsChecked && privacyChecked && user_categories && user_categories.length > 0) {
            const params = functions.parseFormData(new FormData(this.formRef));
            params.password = (md5(params.password)).toUpperCase();

            register(params).then(() => {
                toast.success(messages.REGISTER_SUCCESS);
                push(paths.client.APP_LOGIN);
            }).catch(({ response: { data } }) => {
                if (data.errorCode === 14) {
                    return toast.error(messages.EMAIL_ALREADY_TAKEN);
                } else if (data.errorCode === 27) {
                    this.captchaRegister.reset();
                    return toast.error(messages.RECAPTCHA_ERROR);
                }

                return toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        } else if (!user_categories || user_categories.length < 1) {
            return toast.error('Please select at least one skill');
        } else if (!jobber_type) {
            return toast.error('Please select your jobber type');
        } else if (!termsChecked || !privacyChecked) {
            return toast.error('Please agree to our Terms of Service and Privacy Policy to continue');
        } 
    };

    render() {
        const { isSubmitting } = this.props;
        const { location, termsChecked, privacyChecked, user_categories, submit_categories, jobber_type } = this.state;

        const searchOptions = {
            componentRestrictions: { country: ['au'] }
        }

        return (
            <div className="auth-page gradient-background">
                <div className="header text-right" >
                    <Link to={paths.client.APP_LOGIN} className="btn btn-transparent mb-2">Have Account?</Link>
                </div>

                <div className="container">
                    <a className="logo" href="/">
                        <img src="/static/images/logo-white/logo.png" alt="" />
                        <h3>Crew Pond</h3>
                    </a>
                    <div className="inner-content">
                        <div className="page-title">Sign Up</div>

                        <form ref={ref => this.formRef = ref} onSubmit={this.handleSubmit} noValidate>
                            <div className="row">
                                <div className="col-12 form-group">
                                    <input type="text" name="first_name" className="form-control" placeholder="First Name" required />
                                    <div className="invalid-feedback">This field is required.</div>
                                </div>
                                <div className="col-12 form-group">
                                    <input type="text" name="last_name" className="form-control" placeholder="Last Name" required />
                                    <div className="invalid-feedback">This field is required.</div>
                                </div>
                                <div className="col-12 form-group">
                                    <input type="email" name="email" className="form-control" placeholder="Email" required />
                                    <div className="invalid-feedback">This field is required.</div>
                                </div>
                                <div className="col-12 form-group">
                                    <input type="password" name="password" className="form-control" placeholder="Password" required minLength={constant.PASSWORD_MIN_LENGTH} />
                                    <div className="invalid-feedback">Password must include at least {constant.PASSWORD_MIN_LENGTH} characters.</div>
                                </div>
                                <div className="col-12 form-group">
                                    <input type="hidden" name="address" value={location? location.address : null}/>
                                    <input type="hidden" name="place_name" value={location? location.address.split(",")[0] : null}/>
                                    <input type="hidden" name="latitude" value={location? location.latitude : null}/>
                                    <input type="hidden" name="longitude" value={location? location.longitude : null}/>
                                    <PlacesAutocomplete
                                        value={location?location.address:""}
                                        onChange={this.handlePlaceChange}
                                        onSelect={this.handlePlaceSelect}
                                        searchOptions={searchOptions}
                                    >
                                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                        <div>
                                            <input
                                            {...getInputProps({
                                                placeholder: 'Location',
                                                className: 'form-control dark-input input-field',
                                                required: true
                                            })} />
                                            <div className="invalid-feedback">This field is required.</div>
                                            {suggestions.length>0?<div className="autocomplete-dropdown-container">
                                                {loading && <div>Loading...</div>}
                                                {suggestions.map(suggestion => {
                                                    const className = suggestion.active
                                                    ? 'suggestion-item--active'
                                                    : 'suggestion-item';
                                                    // inline style for demonstration purpose
                                                    const style = suggestion.active
                                                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                                    return (
                                                    <div
                                                        {...getSuggestionItemProps(suggestion, {
                                                        className,
                                                        style,
                                                        })}
                                                    >
                                                        <span style={{color: '#000'}}>{suggestion.description}</span>
                                                    </div>
                                                    );
                                                })}
                                            </div>:null}
                                        </div>
                                        )}
                                    </PlacesAutocomplete>
                                </div>
                                <div className="col-12 form-group">
                                    <input type="hidden" name="categories" value={JSON.stringify(submit_categories)}/>
                                    <Select
                                        customClassName="select-skill"
                                        styles={customStyles}
                                        name="filters"
                                        placeholder="Select your skills"
                                        value={user_categories}
                                        options={categories}
                                        onChange={this.selectCategory}
                                        isMulti
                                    />
                                </div>
                                <div className="col-12 form-group">
                                    <input type="hidden" name="jobber_type" value={jobber_type? jobber_type : null}/>
                                    <Select 
                                        styles={customStyles}
                                        name="jobber_type_select"
                                        placeholder="Select your type"
                                        value={this.jobberTypeOptions.find(el=>el.value === jobber_type)}
                                        options={this.jobberTypeOptions}
                                        onChange={this.selectJobberType}
                                    />
                                </div>
                            </div>
                            <div className="form-action">
                                <div className="left-wrapper">
                                    <Checkbox
                                        checked={termsChecked}
                                        name="terms_service"
                                        onChange={() => this.handleCheckChange('terms')}
                                        label={<React.Fragment>I agree <a href={paths.client.APP_TERMS}>Terms of Service</a></React.Fragment> }
                                    />
                                    <Checkbox
                                        checked={privacyChecked}
                                        name="privacy_policy"
                                        onChange={() => this.handleCheckChange('privacy')}
                                        label={<React.Fragment>I agree <a href={paths.client.APP_PRIVACY}>Privacy Policy</a></React.Fragment> }
                                    />
                                </div>

                                <div className="right-wrapper">
                                    <button type="submit" className="btn btn-block btn-success" disabled={isSubmitting}>
                                        {isSubmitting ? <i className="fa fa-spin fa-circle-o-notch" /> : 'Sign Up'}
                                    </button>
                                </div>
                            </div>
                            <div className="recaptcha-container">
                                <ReCAPTCHA 
                                    className="recaptcha"
                                    ref={(el) => {this.captchaRegister = el;}}
                                    size="normal"
                                    type="image"
                                    sitekey={process.env.RECAPTCHA_SITE_KEY}
                                    onChange={this.verifyCallback}
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <div className="footer">
                    <ul>
                        <li><a href={paths.client.APP_TERMS}>Terms & Conditions</a></li>
                        <li><a href={paths.client.APP_PRIVACY}>Privacy Policy</a></li>
                        <li><a href={paths.client.APP_PRICING}>Pricing</a></li>
                        <li><a href={paths.client.APP_FAQ}>FAQ</a></li>
                    </ul>
                </div>
            </div>
        );
    }
}

Register.propTypes = {
    register: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    getCategories: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired
};

export default connect(
    selectors,
    {
        ...actions.authentication,
        ...actions.categories 
    }
)(withRouter(Register));
