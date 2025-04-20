# TODO
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
    & Trisk keys on any loot table are dropped in order, eg. _fragment_1, then the next is _fragment_2, and finally _fragment_3, then going back to _fragment_1 as the next drop

    & Drops with a x b/c is calculated by a = number of drops per kill and b/c is the ratio at which the chance is per drop, per kill

    & Some Group bosses have drop chance alterations based on the number of people in the kill, such as:

        - The_Ambassador
            + Has a base drop rate of 1/300 (solo encounters), 1/1000 (duo encounters), or 1/1,500 (trio encounters), with a threshold of 60 for solo encounters, 200 for duo and 300 for trio encounters (combined solo and group killcount). Example: If a player were to have 101 group and 144 solo (combined 245), it would be 4 thresholds for solo, 1 threshold for duo and 0 thresholds for trio.
        


    - Araxxi
        + The drop table will always roll on three tables; 100%, food/potions and main table drop once. Effigies from Araxxi are considered a primary drop. A roll will also be made on pets (the araxyte pet itself and then eggs if eligible), leg pieces and "Add-on" drops. These three drops are all tertiary drops, so it is possible to obtain all three from one kill, although exceedingly rare.
            + Pet chance: Has a base drop rate of 1/500 with a threshold of 200 up to 1/50

    - Arch Glacor : Normal Mode
        + In normal mode, three sets of drops are awarded at a time. In solo encounters, the player receives all three drops. In duo encounters, the leftover drop is awarded to the top damaging player. In larger groups, the three top damage dealers receive one drop each. The quantity and quality of drops in normal mode are dependent on how many mechanics were enabled.
    

