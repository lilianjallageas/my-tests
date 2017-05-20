// app.js

new Vue({

	// Vue Element
	// ===========
	el: '#app_mine-sweeper',


	// Vue Data
	// ===========
	data: {
		landmine_defaults: { rows: 10, columns: 10, nbBombs: 10 },
		landmine: [],
		flagMode: false,
		isGameLost: false,
		isGameWon: false
	},


	// Vue Mounted
	// ===========
	mounted: function() {
		this.buildLandmine();
	},


	// Vue Methods
	// ===========
	methods: {

		// buildLandmine: Loads the landmine
		// --------------
		buildLandmine: function() {
			// Clear the previous landmine
			this.landmine = [];
			this.isGameLost = false;
			// Creating the cells (looping through each row/column)
			for (var i = 0; i < this.landmine_defaults.rows ; i++) {
				var row = [];
				for (var j = 0; j < this.landmine_defaults.columns; j++) {
					row.push({ isBomb: false, isFlagged: false, nbNearBomb: 0, isRevealed: false, coordinates: i+'x'+j });
				};
				this.landmine.push(row);
			};
			// Placing the bombs on the landmine
			this.placeBombs();
		},

		// reveal: Reveals a specific cell
		// --------------
		reveal: function(i_row, i_col) {
			// If the game was won, we don't allow the user to click on the cells anymore
			if (this.isGameWon) { return; };
			// If 'flag mode', we flag the cell
			if (this.flagMode) {
				this.flag(i_row, i_col);
				return;
			};
			// We reveal the cell only if it's not flagged
			if (this.landmine[i_row][i_col].isFlagged == false) {			
				//If the user clicks on a bomb, the game is lost
				if (this.landmine[i_row][i_col].isBomb == true) { 
					this.isGameLost = true;
					this.revealAllLandmine();
				} else if (this.landmine[i_row][i_col].nbNearBomb == 0) {
					this.cleanEmptyCellsAround(i_row, i_col);
				};
				this.landmine[i_row][i_col].isRevealed = true;
				// We check if the user has won the game
				this.hasWon()
			};
		},

		// flag: Flags a cell
		// --------------
		flag: function(i_row, i_col) {
			this.landmine[i_row][i_col].isFlagged = !this.landmine[i_row][i_col].isFlagged;
		},

		// revealAllLandmine: Reveals the entire landmine, when the user lost.
		// --------------
		revealAllLandmine: function() {
			for (var i = 0; i < this.landmine_defaults.rows; i++) {
				for (var j = 0; j < this.landmine_defaults.columns; j++) {
					this.landmine[i][j].isRevealed = true;
				}
			}		
		},

		// placeBombs: Puts the bombs on the landmine
		// --------------
		placeBombs: function() {
			var i = 0;
			while (i < this.landmine_defaults.nbBombs) {
				// Get random bomb location
				var row_bomb = _.random(this.landmine_defaults.rows-1);
				var col_bomb = _.random(this.landmine_defaults.columns-1);
				if (this.landmine[row_bomb][col_bomb].isBomb == false) { // We only place the bomb if the cell isn't a "bomb" already
					this.landmine[row_bomb][col_bomb].isBomb = true; // We place the bomb on the cell
					this.updateNbNearBomb(row_bomb, col_bomb); // We update the number of bombs on the cells next to it
					i++; // One more bomb placed on the map
				};
			}
		},

		// updateNbNearBomb: Updates the number of bombs next the the cell containing the bomb
		// --------------
		updateNbNearBomb: function(row_bomb, col_bomb) {
			for (var i = -1; i <= 1; i++) {
				for (var j = -1; j <= 1; j++) {
					var x = row_bomb + i;
					var y = col_bomb + j;
					if (x >= 0 && y >= 0 && x < this.landmine_defaults.rows && y < this.landmine_defaults.columns) { // Only in the boundaries of the landmine
						this.landmine[x][y].nbNearBomb += 1;
					};
				}
			};
		},

		// cleanEmptyCellsAround: Reveals the cells around a cell with no bombs
		// --------------
		cleanEmptyCellsAround: function(i_row, i_col) {
			for (var i = -1; i <= 1; i++) {
				for (var j = -1; j <= 1; j++) {
					var x = i_row + i;
					var y = i_col + j;
					// Avoiding the actual cell => Only cleaning the cells around
					if (x != i_row || y != i_col) {
						// Only in the boundaries of the landmine
						if (x >= 0 && y >= 0 && x < this.landmine_defaults.rows && y < this.landmine_defaults.columns) { 
							// Only cleaning cells that haven't been revealed already (to prevent infinite loop with the recursion)
							if (this.landmine[x][y].isRevealed == false) {
								// We reveal the cell.
								this.landmine[x][y].isRevealed = true;
								// If the cell has no bombs (and hasn't been revealed yet), we recursively reveal the cells around.
								if (this.landmine[x][y].nbNearBomb == 0) {
									console.log("Cleaning the cells around "+x+"x"+y);
									this.cleanEmptyCellsAround(x,y);
								};
							};
						};
					};
				}
			};
		},

		// hasWon: Checks if the user has won the game.
		// To win the game, all the safe spaces have to be 'revealed'
		// --------------
		hasWon: function() {
			if (this.isGameLost) { return; };
			for (var i = 0; i < this.landmine_defaults.rows ; i++) {
				for (var j = 0; j < this.landmine_defaults.columns; j++) {
					if (this.landmine[i][j].isBomb == false && this.landmine[i][j].isRevealed == false) {
						// There's at least one 'safe' cell that hasn't been revealed, therefore the game isn't completed yet
						return;
					};
				};
			};
			// If we reach that point, it means that all safe cells have been revealed => Game Win
			this.isGameWon = true;		
		},

		// getCellClass: Gets the CSS class for the cell
		// --------------
		getCellClass: function(cell) {
			if (cell.isRevealed) {
				if (!cell.isBomb && cell.nbNearBomb == 0) { return 'active'; };
				if (cell.isBomb) { return 'danger'; };
			};
		}

	}

});