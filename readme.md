# TODO
- On the parsed JSON, import the (random number if quantity is a range eg. 70-90, choose a number between these numbers anytime this number hits) "Quantiy" values and apply that number like we did for the "Charms" number, use the same styling.
- Make pricing Ironman Friendly/Show alch pricing toggle
    * Ironman toggle button
- Add Scavenging 1,2,3,4 probabilities when toggle selected eg.
    [] Scav 1
    [] Scav 2
    [x] Scav 3
    [] Scav 4
- Integrate with ALT1 toolkit
- Finish the telos enr drop rate mechanic w/ slider
    right now enrage doesn't do anything to better/change the drop rate

- Add the .charmqty styling to all noted/coin items
- Gem DROP TABLE Mechanics
    - 1/128 to hit this table
      - RARE DROP TABLE mechanics
        - 9/128 to hit the "RARE DROP TABLE" loot table from Gem DROP TABLE

- Remove Enrage bar if the monster doesn't have an enrage
    # Monsters w/ enrage
        - Arch Glacor
        - Telos
        - Zammy
        
# ALT1 TODO Features:
- Loot interface matching alt1 theme
- Use of Alt+1 key when right clicking a monster in-game to search wiki for the name eg, /w/{al1+1}

# Boss Drop Explanations:
    [x] & Add a "Luck of the Dwarves" toggle which grants a +1% increase only in the total sum added at the top of the page

    [x] & Crystal_triskelion_ on any loot table are dropped in order, eg. _fragment_1, then the next is _fragment_2, and finally _fragment_3, then going back to _fragment_1 as the next drop

    [x] & Drops with a x b/c is calculated by a = number of drops per kill and b/c is the ratio at which the chance is per drop and per kill, eg."Rarity"/"Drop Rate" 7 x 1/2448 means there's a possibility to have a total of 7 loots/drops per kill with a 1/2448 chance to recieve that item per loot/drop.

    & Some Group bosses have drop chance alterations based on the number of people in the kill, this includes:
        Araxxi
        The_Ambassador
        Arch_Glacor


    - The_Ambassador
            + Umbral urn has a base drop rate of 1/300 (solo encounters), 1/1000 (duo encounters), or 1/1,500 (trio encounters), with a threshold of 60 for solo encounters, 200 for duo and 300 for trio encounters
                - So we will need to alter the table layout to include 5 sections split into:
                    ` Dungeon drop table
                    ` Secondary drop
                    ` Main drop (Solo)
                    ` Main drop (Duo)
                    ` Main drop (Trio)
                - The "Main Drop (x)" will have the same items so we can leave these out of the Dungeon drop table and the Secondary drop:
                    ` Reinforced_dragon_bones
                    ` Black_stone_arrow_tips
                    ` Black_stone_heart
                    ` Eldritch crossbow stock
                    ` Eldritch crossbow limb
                    ` Eldritch crossbow mechanism
                    ` Umbral urn

            + Eldritch_crossbow_ on any loot table are dropped in order, eg. Eldritch_crossbow_stock first, then the next is Eldritch_crossbow_limb, and finally Eldritch_crossbow_mechanism, then going back to Eldritch_crossbow_stock as the next drop

            + The_Ambassador is a 'raid' type boss where multiple other monsters are required to be killed, these also drop loot, for this, theyre in the "Floor 1", "Floor 2", "Floor 3" tables. And there are aprox. 50 monsters per floor (150 total for each "The_Ambassador" kill). Account for this in our calculations and include all floors and their respective loots.

            + Since we have floors, let's have a toggle to display or hide each floor and their table/loot/pricing

            + Lets also add a toggle for "Drop Enhancer", when this is toggled on, the "Dungeon drop table" for this boss is then shown, otherwise it's hidden. Additionally the drop rates for this table when the enhancer is toggled is 1/50

            + Add a toggle for this boss to display the new drop rates based on the number of people killing the boss, eg 1, 2, 3. Apply the rates only to the "Main drop (x)" tables.
                            
    - Araxxi # Done with explanation
        + The drop table will always roll on three tables; 100%, food/potions and main table drop once. Effigies from Araxxi are considered a primary drop. A roll will also be made on pets (Araxyte_egg), leg pieces and "Add-on" drops. These three drops are all tertiary drops, so it is possible to obtain all three from one kill, although exceedingly rare.
            + Total amount of items possible to be obtained per killed based on this information is 5, but only one drop from "Food and potions" and the "Main drops" are a 100% garuntee 
                + Dwarf_weed_seeds and avantoe seeds are always dropped together.
                + Necrite_ston_spirit and phasmatite_stone_spirit are always dropped together.
            + Pet chance: Has a base drop rate of 1/500 with a threshold of 200 up to 1/50
            + Attachment chance: 
                - 1/240 for duo, 1/120 for solo for the combat style that has the matching item with that style
                - 1/480 for duo, 1/240 for solo for non matching combat styles
                    eg. fighting with Melee has a 1/240 chance to receive the "Araxxi's_web", and a 1/480 chance to reeceive the Araxxi's_eye or Araxxi's_fang
                Melee = Araxxi's_web
                Ranged = Araxxi's_eye
                Magic = Araxxi's_fang 


    - Astellarn # Done with explanation
        + This monster has very similar tables to "The_Ambassador", which include "Main drops (solo)", "Main drops (duo)", "Main drops (trio)", their drop rates also change depending on how many people are in the instance. Add the toggles and hide/show the tables like we did for "The_Ambassador".

        + The Greater_Flurry_ability_codex changes drop rates based on how many people are in the encounter. The rates are 
            ` Solo: 1/83.3
            ` Duo: 1/167
            ` Trio: 1/250

        + The Onyx_dust for the three "Main drops (x)" tables have the same rates for each but the drop quantity increases with lower people in the instance/kill:
            ` Solo: 10–30
            ` Duo: 5-15
            ` Trio: 5    

        + This boss is also a "Raid" boss, so monsters need to be killed before reaching it and these are the 'minions' loot table, we will use the same ratio as we did with "The_Ambassador":
            - This boss has one floor, and it's drop table is "Dungeon drop table". That also only gets rolled if the "Enhancer" is toggled with a 1/50 chance as well (aprox. 50 minions before killing "Astellarn").
                If "Dungeon drop table" is not hit in 1/50 then this is the table and loot:
                ` Laboratory relic (common)	
                ` Laboratory relic (uncommon)
                ` Laboratory relic (rare)
                ` Coins
                ` Raw swordfish
                ` Logs
                ` Prayer potion (1)
                ` Weapon poison++ (1)
                ` Starved ancient effigy

        + This boss also always has a 100% drop table, keep the rates at rarity the same, and add one of these based on their rates for each new kill as one of them is always dropped:
            ` Blue_dragonhide
            ` Red_dragonhide
            ` Black_dragonhide
        
        + This boss has a "Rare drop table" loot table, which has a chance of 1/100 for each new kill of "Astellarn", not the minions. Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

    - Beastmaster_Durzag # Done with explanation
        + Durzag's_helmet Has a base drop rate of 1/300 with a threshold of 60 capping at 1/30

    - Black_stone_dragon # Done with explanation
        + for this boss, we have multiple "Draconic_energy" drops per "Main drops(x)" table, lets remove any duplicates in each table and apply one flat rate for each table by calculating the median of the this specific drop for each table, eg. :
            Main drops (Solo) : Median Quantity, Rarity, GE Price
            Main drops (Duo) : Median Quantity, Rarity, GE Price
            Main drops (Trio) : Median Quantity, Rarity, GE Price
        - To give some help the average amount of Draconic_energy per kill is:
            (Solo) : 11
            (Duo) : 4
            (Trio) : 1
        
        + The Inert_black_stone_crystal has a base drop rate of 1/300 in solo, 1/1000 in duo and 1/1500 in trio, with thresholds of 60, 200 and 300, respectively. Capping at 1/150
 
        + This has a table named "Secondary drops" and there's one of these drops per kill.
        
        + Similarly to "The_Ambassador" and the "Astellarn" this boss is also a "Raid boss". So we will also add the "Dungeon drop table" as a 1/50 chance to land in it when killing the minions in the dungeon (aprox 100 minions before killing "Black_stone_dragon"). Otherwise we will fallback to:
                ` Laboratory relic (common)	
                ` Laboratory relic (uncommon)
                ` Laboratory relic (rare)
                ` Coins
                ` Raw swordfish
                ` Logs
                ` Prayer potion (1)
                ` Weapon poison++ (1)
                ` Starved ancient effigy

        + This boss has a "Rare drop table" loot table, which has a chance of 1/100 for each new kill of "Black_stone_dragon", not the minions. Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

    - Corporeal_Beast # Done with explanation
        + This boss has a "Gem drop table" loot table, which has a chance of 1/47 to be rolled on for each new kill of "Corporeal_Beast" which will be replaced as a drop and give one of the loots on this table instead for that kill. Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

    - Crassian_Leviathan # Done with explanation
        + This boss has similar loot tables to "The_Ambassador", where:
            "Dungeon drop table" is based off 50 'minion' kills for each 1 kill of "Crassian_Leviathan", this is also a 1/50 chance to land on this table, if this table isn't rolled then we will fallback to "Floor 1" & "Floor 2" tables and these are the only tables we will include in this boss's loot table page. Ignoring "Floor 3".

    - Croesus # Done with explanation
        + This boss has 11 loots/drops per kill so take that into account in our calculations.
        + We will use the 1/441 drop rate for each of the items
         ` Croesus foultorch
         ` Croesus sporehammer
         ` Croesus spore sack
         ` Cryptbloom helm (incomplete)
         ` Cryptbloom top (incomplete)
         ` Cryptbloom bottoms (incomplete)
         ` Cryptbloom gloves (incomplete)
         ` Cryptbloom boots (incomplete)
         ` Scripture of Bik
            + For Croesus's enriched root we will use the rate of 1/1000 with a threshold of 500 capping at 1/100

    - Gregorovic # Done with explanation
        + This boss has a "Rare drop table" loot table, which has a chance of 2/128 for each new kill of "Gregorovic" and 4/128 if the "Hard Mode" button is toggled. Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

        + Add a toggle to this page display "25% Reputaion", "50% Rep", "75% Rep", and "100% Rep". When one of these are toggled multiply the Drop Rate column by that amount (25%, 50%, 75%, or 100%) respectively only allow one selection for these toggles. eg. if the Drop rate for "Dormant_anima_core_helm" is originally 1/512, it will be 1/256 if "100% Rep" is toggled.

        + This boss has a drop rate for "Faceless_mask" of 1/2000 with a threshold of 400 capping at 1/200, this rate is not affected by the "x% rep" toggled buttons.

        + Add a toggle for "Hard Mode", and replace the current "Main drop" table with the second found "Main drop" table in the "Drops (hard mode) section, it should start with 
        "Coins", "Quantity: 70,000-95,000"
        and the last row is 
        "Battlesaff", "Quantity: 45-70 (noted)"
         -  Having the hardmode button toggle also increases the drop rate of "Faceless_mask" from 1/2000 with a threshold of 400 capping at 1/200, to 1/1000 with a threshhold of 400 capping at 1/100.

    - Helwyr # Done with explanation
        + This boss has a "Rare drop table" loot table, which has a chance of 2/128 for each new kill of "Helwyr" and 4/128 if the "Hard Mode" button is toggled. Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

        + Add a toggle to this page display "25% Reputaion", "50% Rep", "75% Rep", and "100% Rep". When one of these are toggled multiply the Drop Rate column by that amount (25%, 50%, 75%, or 100%) respectively only allow one selection for these toggles. eg. if the Drop rate for "Dormant_anima_core_helm" is originally 1/512, it will be 1/256 if "100% Rep" is toggled.

        + This boss has a drop rate for "Twisted_antler" of 1/2000 with a threshold of 400 capping at 1/200, this rate is not affected by the toggled "x% rep" buttons.

        + Add a toggle for "Hard Mode", and replace the current "Main drop" table with the second found "Main drop" table in the "Drops (hard mode) section, it should start with 
        "Coins", "Quantity: 70,000-95,000"
        and the last row is 
        "Lantadyme seed", "Quantity: 9–13"

         -  Having the hardmode button toggle also increases the drop rate of "Twisted_antler" from 1/2000 with a threshold of 400 capping at 1/200, to 1/1000 with a threshhold of 400 capping at 1/100.

    - Har-Aken # Done with explanation
        + This boss has a drop rate for "Volcanic_shard" of 1/120 with a threshold of 40, capping at 1/20.

    - Hermod,_the_Spirit_of_War # Done with explanation
        + This boss has a drop rate for "Hermod's_armour_spike" of 1/2000 with a threshhold of 400 caping at 1/200

    - Kalphite_King # Done with explanation
        + This boss has a drop rate for "Kalphite_claw" of 1/2000 with a threshold of 400 capping at 1/200

        + This boss has a "Rare drop table" loot table, which has a chance of 1/50 for each new kill of "Kalphite_King". Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

    - Kalphite_Queen # Done with explanation
        + This boss has a drop rate for "Kalphite_egg" of 1/2500 with a threshold of 500 capping at 1/250

        + This boss has a "Rare drop table" loot table, which has a chance of 16/128 for each new kill of "Kalphite_Queen"
        Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

    - Kerapac # Done with explanation
        + This boss has a "Hard Mode" version as well, so add the "Hard Mode" toggle button to this boss as well and we will look for both "Normal mode" drop table, and "Hard mode" drop table however show the "Normal mode" table by default and hide the "Hard mode" table, and if the "Hard mode" is toggled, hide the "Normal table" and show the "Hard mode" table.
        
        + This boss also drops a total of 3 drops per kill and also needs to have toggle buttons for duo, and trio (only allow for one to be toggled at a time).
        The amount of drops slightly change for each person. For example:
        Solo = 3 drops per kill
        Duo = 1 drop garunteed for each kill and a 50% chance to get a second drop
        Trio = 1 drop only

        + With this new drop mechanic our "Rarity" json table we get from the api now introduces the amount of loots as well as the rarity, for example:
            ` Item | Quantity | Rarity | GE price |
            ` Kerapac's wrist wraps | 1 | 3 x 1/768 |
            - Here we see that there's 3 total drops and each drop has a 1/768 chance to receive that item.

        + The drop rate for "Kerapac's_mask_piece" normally is 1/3000 per drop with a threshhold of 500 capping at 1/300
            - in "Hard mode" this is now 1/1500 with a threshold of 500 capping at 1/150

    - King_Black_Dragon # Come back to this one probably cause RDT
        + This boss we will only include the "P2P world" table and ignore the "F2P world" table
            - additionally we will ignore the second "Gem and rare drop table" table, or if it helps, remove/ignore the 
            duplicates. Have a toggle to "Show RDT" and display this table, otherwise, hide the table.
        
        + This boss drops "King_black_dragon_scale" at a rate of 1/2500 with a threshold of 500 capping at 1/250

    - Nex
        + This boss has a "Rare drop table" loot table, which has a chance of 3/128 for each new kill of "Nex". Have a toggle to "Show RDT" and display this table, otherwise, hide the table.
        
        + When 10 Saradomin brews are dropped, 30 super restores will be dropped along with them. When 30 Saradomin brews are dropped, 10 super restores will be dropped along with them.

        + This boss has a "Blood-soaked feather" drop rate of 1/2000 with a threshold of 400 capping at 1/200

    - Nex,_Angel_of_Death (7-man)
        + For this boss, after parsing the data, we want to divide the Quantity by 7 rounding down to the nearest whole number and use this new number as our calculation to times the GE Price to get our total value, do not do this to the "Blood_tentacle" drop. 

        + This boss has a "Blood tentacle" drop at a rate of 1/3000 with a threshold of 600 capping at 1/300

    - Osseous
        + This boss has a "Rare drop table" loot table, which has a chance of 1/128 for each new kill of "Osseous". Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

        + This boss has a "Calcified heart" drop at a rate of 1/2000 with a threshold of 1000, capping at 1/200

    - Orikalka
        + This boss has a "Rare drop table" loot table, which has a chance of 1/128 for each new kill of "Orikalka". Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

        + This boss has a "Pristine Bagrada rex egg" drop at a rate of 1/2000 with a threshold of 1000, capping at 1/200
    
    - Pthentraken
        + This boss has a "Rare drop table" loot table, which has a chance of 1/128 for each new kill of "Pthentraken". Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

        + This boss has a "Pristine Pavosaurus rex egg" drop at a rate of 1/2000 with a threshold of 1000, capping at 1/200

    - Rathis
        + This boss has a "Rare drop table" loot table, which has a chance of 1/128 for each new kill of "Rathis". Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

        + This boss has a "Pristine Corbicula rex egg" drop at a rate of 1/2000 with a threshold of 1000, capping at 1/200

    - Rasial,_the_First_Necromancer
        + This boss has a "Miso's collar" drop at a rate of 1/1500 with a threshold of 300, capping at 1/150

    - Seiryu_the_Azure_Serpent
        + for this boss, we have multiple "Ancient_scale" drops per "Main drops(x)" table, lets remove any duplicates in each table and apply one flat rate for each table by calculating the median of this specific drop for each table, eg. :
            Main drops (Solo) : Median Quantity, Rarity, GE Price
            Main drops (Duo) : Median Quantity, Rarity, GE Price
            Main drops (Trio) : Median Quantity, Rarity, GE Price
        - To give some help the average amount of Ancient_scale per kill is:
            (Solo) : 12
            (Duo) : 12
            (Trio) : 6
        
        + The Chipped_black_stone_crystal has a base drop rate of 1/300 in solo, 1/1000 in duo and 1/1500 in trio, with thresholds of 60, 200 and 300, respectively. Capping at 1/150
        
        + Similarly to "The_Ambassador" and the "Astellarn" this boss is also a "Raid boss". So we will also add the "Dungeon drop table" as a 1/50 chance to land in it when killing the minions in the dungeon (aprox 150 minions before killing "Seiryu_the_Azure_Serpent"). Otherwise we will fallback to the table that has:
                ` Coins
                ` Relic of aminishi (common)
                ` Logs
                ` Raw swordfish
                ` Relic of aminishi (uncommon)
                ` Prayer potion (1)
                ` Weapon poison++ (1)
                ` Chimes
                ` Menaphite gift offering (small)
                ` Suspicious gunpowder
                ` Taijitu
                ` Huge spiky rune salvage
                ` Dark animica stone spirit
                ` Relic of aminishi (rare)
                ` Stoneberry seed
                ` Stormberry seed
                ` Seiryu's claw
                ` Starved ancient effigy

        + This boss has a "Rare drop table" loot table, which has a chance of 1/100 for each new kill of "Seiryu_the_Azure_Serpent", not the minions. Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

    - Solak
        + This boss has a "Imbued bark shard" drop at a rate of 1/1200 with a threshold of 240, capping at 1/120

    - Taraket_the_Necromancer # Done with explanation
        + This boss has similar loot tables to "The_Ambassador", where:
            "Dungeon drop table" is based off 150 'minion' kills for each 1 kill of "Taraket_the_Necromancer", this is also a 1/50 chance to land on this table, if this table isn't rolled then we will fallback to "Floor 1" & "Floor 2" tables and these are the only tables we will include in this boss's loot table page. Ignoring "Floor 3".

    - Telos,_the_Warden
        + This boss will introduce an "Enrage" mechanic capping at 4000%
            - A player can kill telos unlimited amount of times at any enrage they want, so we will introduce a Slider that can be moved to select a desired enrage.
                - The higher the enrage, the better the loot given by the calculations below:

        + The drop rate of the unique items is dependent on Telos' enrage and killstreak; the higher these two values are (especially the latter), the higher the chance a unique drop will be rolled upon defeating Telos.

        + Killing Telos within 25-99% enrage will grant the player 'Silver tier loot', which has a 10 times reduced chance to access the unique drop table. If the enrage is below 25%, the player will be awarded 'Bronze tier loot', which has a 3 times reduced chance on top of the previous drop modifier, meaning that obtaining unique drops would be 30 times rarer than normal.
            - The "Unique drop table" includes items with "Varies" as their rarity such as: Dormant_Seren_godbow, Dormant_staff_of_Sliske, etc
            
            - It was worked out that the equation for the unique item drop rates could be:
            min(1/15,1000+25x(e+l)+300xs/100000)
                Where e is the enrage of Telos, s is the number of total kills done in the streak (so streak+1 if using the streak value), and l is either 25 or 0, depending on whether the chest was looted with "Enhancer" toggled or not.

            or easily interpreted as:
            min(1/15,1/1000x(1+e+l/40+s/3.33))
                Where it can be seen that the base chance is 1/1000, and increases by 1/1000 for every 40 enrage (including luck bonus) or 3.33 kills in streak.

            - The quantity of common rewards is dependent on the player's killstreak. As the killstreak increases, both the maximum and minimum values of potential rewards will continue to increase based how high the enrage is set; only uncut onyxes are unaffected by the minimum value, which is always 1. The maximum values are likely to be even higher with a very high killstreak.

            - With all this information, the most common ways to kill telos are:
            ` 100% Enrage no kill streak
            ` 999% Enrage no kill streak
            ` 2449% Enrage no kill streak
            ` 4000% enrage no kill streak
            Include these as a drop down selection when Telos is selected as the boss.
            - When starting kills at any % enrage increase the rate using the formula above for each additional kill.
            eg. at 200 kill streak with a cap of 4000% it should equal to around 3,200,000,000 (give or take based on rates, but this is an average)

    - Chaos elemental
        + This boss has a "Minor drops" table, one of these items will always be droped alongside a "Major drops" loot tables: Runes and ammunition, Herbs, Seeds, Ancient Warriors' equipment, Ancient artefacts, Brawling gloves, Other, Tertiary, Universal drops. We will ignore the "Free-to-play drops" section and their tables.
        
        + This boss uses a x roll drop mechanic where x is the first number in the "Rarity" eg:
         3 × 1/1,147 for "Grimy_guam"
         where this loot is rolled '3' times at a rarity rate of 1/1147, another example:
         2 x 1/73 for "Spirit_weed_seed"
         where this loot is rolled '2' times at a rarity rate of 1/73
            - Make sure rarity rates like this are parsed correctly in our own table if this drop is rolled.

        + This boss has a "Rare drop table" loot table, which has a chance of 1/128 for each new kill of "Rathis". Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

        + This boss drops "Ribs_of_chaos" at a rate of 1/2500 with a threshold of 500, capping at 1/250 reached at 4500 kills.

    - The_Gate_of_Elidinis
        + This boss drops "Fragment_of_the_Gate" at a rate of 1/1500 with a threshold of 400, capping at 1/150.

    - Queen_Black_Dragon
        + This boss has a "Rare drop table" loot table, which has a chance of 4/109 for each new kill of "Orikalka". Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

        + This boss has a "Queen Black Dragon scale" drop at a rate of 1/2500 with a threshold of 500, capping at 1/250

        + rolls on three different drop tables at once; the "100%" drops table, "Main drop" table, and "Healing items" table. "Unique" drops, if rolled, are added on the side as tertiary rewards.

    - The_Twin_Furies
        + This boss has a "Rare drop table" loot table, which has a chance of 1/512 for each new kill of "The_Twin_Furies". Hard mode has a rate of 4/128. Add a "Show RDT" toggle button to hide or show the "Rare drop table". By default we can hide it.

        + Add a toggle to this page display "25% Reputaion", "50% Rep", "75% Rep", and "100% Rep". When one of these are toggled multiply the Drop Rate column by that amount (25%, 50%, 75%, or 100%) respectively only allow one selection for these toggles. eg. if the Drop rate for "Dormant_anima_core_helm" is originally 1/512, it will be 1/256 if "100% Rep" is toggled.

        + This boss has a drop rate for "Nymora's_braid" of 1/2000 with a threshold of 400 capping at 1/200, this rate is not affected by the toggled "x% rep" buttons.

        + Add a toggle for "Hard Mode", and replace the current "Main drop" table with the second found "Main drop" table in the "Drops (hard mode) section, it should start with 
        "Coins", "Quantity: 70,000-95,000"
        and the last row is 
        "Batlestaff", "Quantity: 45–70 (noted)"

         -  Having the hardmode button toggle also increases the drop rate of "Nymora's_braid" from 1/2000 with a threshold of 400 capping at 1/200, to 1/1000 with a threshhold of 400 capping at 1/100.

    - TzKal-Zuk
        + This has a hard mode, so add a toggle for "Hard mode".

        + If "Hard mode" isn't toggled we will show the "Normal mode" table loot that has 
            ` Scripture of Ful at a rate of 1/100
            ` Magma Tempest ability codex at a rate of 1/100
                - We will also include "Both modes" table, and "Secondary drops" table

        + If "Hard mode" is toggled we will show the "Hard mode" & "Tertiary drops" table that has
            ` Scripture of Ful at a rate of 1/50
            ` Magma Tempest ability codex 1/50
                - We will also include "Both modes" table, and "Secondary drops" table

        + TzKal-Zuk gives two drops upon each kill. One from "Zuk's table" and another from the "Elite table"

        + TzKal-Zuk drops the "TzKal-Zuk's armour piece" at a rate of 1/500 with a threshold of 100 capping at 1/50 in "Normal mode"/default
        + TzKal-Zuk drops the "TzKal-Zuk's armour piece" at a rate of 1/300 with a threshold of 100 capping at 1/30 in "Hard mode" if it's toggled.

    - Verak_lith
        + This boss has similar loot tables to "The_Black_Stone_Dragon", where:
            "Dungeon drop table" is based off 100 'minion' kills for each 1 kill of "Verak_lith", this is also a 1/50 chance to land on this table, if this table isn't rolled then we will fallback to the table that has:
                ` Laboratory relic (common)	
                ` Laboratory relic (uncommon)
                ` Laboratory relic (rare)
                ` Coins
                ` Raw swordfish
                ` Logs
                ` Prayer potion (1)
                ` Weapon poison++ (1)
                ` Starved ancient effigy

        + This boss has a "Rare drop table" loot table, which has a chance of 1/150 for each new kill of "Verak_lith", not the minions. Have a toggle to "Show RDT" and display this table, otherwise, hide the table.

    - Vindicta_&_Gorvek
        + This boss has a "Rare drop table" loot table, which has a chance of 1/512 for each new kill of "Vindicta_&_Gorvek". Hard mode has a rate of 4/128. Add a "Show RDT" toggle button to hide or show the "Rare drop table". By default we can hide it.

        + Add a toggle to this page display "25% Reputaion", "50% Rep", "75% Rep", and "100% Rep". When one of these are toggled multiply the Drop Rate column by that amount (25%, 50%, 75%, or 100%) respectively only allow one selection for these toggles. eg. if the Drop rate for "Dormant_anima_core_helm" is originally 1/512, it will be 1/256 if "100% Rep" is toggled.

        + This boss has a drop rate for "Glimmering_scale" of 1/2000 with a threshold of 400 capping at 1/200, this rate is not affected by the toggled "x% rep" buttons.

        + Add a toggle for "Hard Mode", and replace the current "Main drop" table with the second found "Main drop" table in the "Drops (hard mode) section, it should start with 
        "Coins", "Quantity: 70,000-95,000"
        and the last row is 
        "Black_dragonhide", "Quantity: 25-50 (noted)"

        + Having the hardmode button toggle also increases the drop rate of "Glimmering_scale" from 1/2000 with a threshold of 400 capping at 1/200, to 1/1000 with a threshhold of 400 capping at 1/100.

    - Vorago
        + This boss has a "Hard mode" so we will add a toggle that is by default off.
        
        + This boss has a possibility of 5 drops so we will add a option at the top to change the amount of from 1 to 5 and this will update the "Quantity" column and subsequently the "Price" column, by default we will leave it at 1

        + For normal mode we will use the "Main loot (both modes)" and "Main loot (normal mode)" loot tables.

        + If "Hard mode" is toggled, we will use the "Main loot (hard mode)" and "Main loot (both modes)" loot tables.

        + Vorago has a "Ancient summoning stone" that drops at a rate of 1/5000 with a threshold of 1000 capping at 1/500 in "Hard mode"

        + Vorago has a "Ancient summoning stone" that drops at a rate of 1/2500 with a threshold of 1000 capping at 1/250 in "Hard mode"

    - Zamorak,_Lord_of_Chaos
        + This boss has severa mechanics determanine drops and the rarity. Add a slider for: 50 Enrage, 100 Enrage, 300 Enrage, 500 Enrage, 2000 Enrage. We will use these numbers as a base for these specific item rarity ratios:
        - 50 enrage:
                ` Vestments of havoc robe top - Rate: 1/1078
                ` Vestments of havoc robe bottom - Rate: 1/1078
                ` Vestments of havoc hood - Rate: 1/1078
                ` Vestments of havoc boots - Rate: 1/1078
                ` Chaos Roar ability codex - Rate: 1/588
                ` Codex of lost knowledge - Rate: 1/277
                ` Top of the Last Guardian's bow - Rate: 1/2325
                ` Divine bowstring - Rate: 1/2325
                ` Bottom of the Last Guardian's bow	- Rate: 1/2325

        - 100 enrage:
                ` Vestments of havoc robe top - Rate: 1/520
                ` Vestments of havoc robe bottom - Rate: 1/520
                ` Vestments of havoc hood - Rate: 1/520
                ` Vestments of havoc boots - Rate: 1/520
                ` Chaos Roar ability codex - Rate: 1/284
                ` Codex of lost knowledge - Rate: 1/144
                ` Top of the Last Guardian's bow - Rate: 1/937
                ` Divine bowstring - Rate: 1/937
                ` Bottom of the Last Guardian's bow	- Rate: 1/937

        - 300 enrage:
                ` Vestments of havoc robe top - Rate: 1/452
                ` Vestments of havoc robe bottom - Rate: 1/452
                ` Vestments of havoc hood - Rate: 1/452
                ` Vestments of havoc boots - Rate: 1/452
                ` Chaos Roar ability codex - Rate: 1/246
                ` Codex of lost knowledge - Rate: 1/125
                ` Top of the Last Guardian's bow - Rate: 1/813
                ` Divine bowstring - Rate: 1/813
                ` Bottom of the Last Guardian's bow	- Rate: 1/813

        - 500 enrage:
                ` Vestments of havoc robe top - Rate: 1/334
                ` Vestments of havoc robe bottom - Rate: 1/334
                ` Vestments of havoc hood - Rate: 1/334
                ` Vestments of havoc boots - Rate: 1/334
                ` Chaos Roar ability codex - Rate: 1/182
                ` Codex of lost knowledge - Rate: 1/100
                ` Top of the Last Guardian's bow - Rate: 1/516
                ` Divine bowstring - Rate: 1/516
                ` Bottom of the Last Guardian's bow	- Rate: 1/516

        - 2000 enrage:
                ` Vestments of havoc robe top - Rate: 1/143
                ` Vestments of havoc robe bottom - Rate: 1/143
                ` Vestments of havoc hood - Rate: 1/143
                ` Vestments of havoc boots - Rate: 1/143
                ` Chaos Roar ability codex - Rate: 1/78
                ` Codex of lost knowledge - Rate: 1/52
                ` Top of the Last Guardian's bow - Rate: 1/172
                ` Divine bowstring - Rate: 1/172
                ` Bottom of the Last Guardian's bow	- Rate: 1/172

        + This boss uses a 'Bad luck mitigation' mechanic for items with "Varies" as their rarity. Explained by: If a player completes ten kills without rolling the 'Signature drops' drop table, a bad luck mitigation begins to take effect. The denominator of the drop chance is decreased for each kill past this threshold, with the number by which it is decreased and the maximum drop chance capped depending on the enrage of the kill.
            - We will use these as a cap:
                ` If 50 enrage is selected, ignore the bad luck mitigation mechanic
                ` If 100 enrage is selected, we will use the 'bad luck mitigation' mechanic and for every kill we don't recieve a 'Signature drop' we will decrease the denomination value by 1 capping at a rate of 1/20 
                ` If 300 enrage is selected, we will use the 'bad luck mitigation' mechanic and for every kill we don't recieve a 'Signature drop' we will we will decrease the denomination value by 1 capping at a rate of 1/20
                ` If 500 enrage is selected, we will use the 'bad luck mitigation' mechanic and for every kill we don't recieve a 'Signature drop' we will we will decrease the denomination value by 2 capping at a rate of 1/20
                ` If 2000 enrage is selected, we will use the 'bad luck mitigation' mechanic and for every kill we don't recieve a 'Signature drop' we will we will decrease the denomination value by 8 capping at a rate of 1/5
                    - With this information, use this when calculating our ratios and for each new kill we add to our counter. Reset to our originaly "Drop rate" once a drop in the "Specialty drops" table was given, eg. If we do 100 kills without a drop at 300 enrage (ratio of 1/452 for Vestments of havoc robe bottom) and we get a drop at 101 due to our 'Bad luck mitigation' putting us at a drop rate of 1/352 then the ratio will reset back to 1/452 since we received a 'Specialty drop' item.
        
        + Keep the 'Common drops' the same

        + This boss drops the "Jewels of Zamorak" in solo mode at a rate of 1/300 with a threshold of 100 capping at 1/30

        + This boss drops the "Jewels of Zamorak" in 'Group mode' at a rate of 1/500 with a threshold of 100 capping at 1/50
            - don't add a toggle for group mode, but show both rates with one specifying it's group and one is solo rates

    - Arch Glacor : Normal Mode
        + Add a toggle for "Hard mode" only show 
        + In normal mode, three sets of drops are awarded at a time. In solo encounters, the player receives all three drops. In duo encounters, the leftover drop is awarded to the top damaging player. In larger groups, the three top damage dealers receive one drop each. The quantity and quality of drops in normal mode are dependent on how many mechanics were enabled.
    

