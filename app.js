// BUDGET CONTROLLER
var budgetController = (function() {
	// 2.) Add the item to the budget controller
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};



	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0)
			this.percentage = Math.round((this.value / totalIncome) * 100);
		else {
			this.percentage = -1;
		};
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};



	Expense.prototype.countNewValues = function(rate){
		this.value = this.value * data.rate;
	};

	Income.prototype.countNewValues = function(rate){
		this.value = this.value * data.rate;
	};

	Expense.prototype.returnVal = function(){
		return this.value;
	}

	Income.prototype.returnVal = function(){
		return this.value;
	}



	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	var setRate = function(from, to){
		var rates = [0.0031, 320];
		var HUFEUR = rates[0];
		var EURHUF = rates[1];

		var rate = 0;
		if (from === "HUF" && to === "EUR"){
			rate = HUFEUR;
		} else if (from === "EUR" && to === "HUF"){
			rate = EURHUF;
		}

		data.rate = rate;

		return rate;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	window.d = data.allItems;

	return {
		addItem: function(type, des, val) {
			var newItem, ID;

			//[1,2,3,4,5], next ID = 6
			//[1,2,4,6,8], next ID = 9 we will delete
			// ID = last ID + 1

			// Create new ID
			// KÉRDÉS!!!!!!!!!
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}
			else {
				ID = 0;
			}
			

			// Create new item based on "inc or exp"
			if (type === "exp") {
				newItem = new Expense(ID, des, val);
			}
			else if (type === "inc") {
				newItem = new Income(ID, des, val);
			}

			//Push it into our data structure
			data.allItems[type].push(newItem);

			// return the new item
			return newItem;
		},

		calculateBudget: function() {

			// calculate total income and expense
			calculateTotal("exp");
			calculateTotal("inc");

			// calculate the budget: income - expense
			data.budget = data.totals.inc - data.totals.exp;
			// calculate the percentage spen

			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} 
			else {
				data.percentage = -1;
			}
		},

		deleteItem: function(type, id) {
			var ids, index
			// id = 6;
			// data.allItems[type][id];
			// ids = [0, 1, 3, 4, **6**, 7];

			// index = **3**;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			};
		},

		calculatePercentages: function() {

			/*  a = 10
				b = 20
				c = 40
				income = 100
				a = 10 / 100 * 100
				b = 20 / 100 * 100
				c = 40 / 100 * 100 */

			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},	

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		calcNewCurrValues: function(from, to) {

			var addRate = setRate(from, to);

			data.allItems.inc.forEach(function(cur){
				cur.countNewValues(addRate);
			});
			data.allItems.exp.forEach(function(cur){
				cur.countNewValues(addRate);
			});
			
			return addRate;
		},

		getItemsArray(type) {
			var array = Array.from(data.allItems[type].map(el => el.value));
			return array;
		},

		testing: function() {
			console.log(data);
			console.log(data.totals);
		}
	};

})();



// UI CONTROLLER - we write it here and THEN will call them in the GLOBAL contorller
var UIController = (function() {

	// CENTRAL PLACE to change class strings at one place
	var DOMstrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputCurrency: ".add__currency",
		// from controller
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		// Ui
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expenseLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expPercentageLabel: ".item__percentage"
	};

	var nodeListForEach = function(list, callback) {
				for (var i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
			};

	var formatNumbers = function(num, type) {
			var num, numSplit, integ, dec, type;
			/*
				two decimals
				coma after thousands
				-/+
			*/

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split(".");

			integ = numSplit[0];
			if (integ.length > 3) {
				integ = integ.substr(0, integ.length - 3) + "," + integ.substr(integ.length - 3, integ.length);  //  2,530 if greater then automatically 25,300
			}

			dec = numSplit[1];

			return (type === "exp" ? "-" : "+") + " " + integ + "." + dec;

		};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element;
			// Create HTML strings with some placeholder text
			if (type === "inc") {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} 
			else if (type ==="exp") {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			// Replace the placeholder text with some actual data

			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNumbers(obj.value, type));

			// Insert the HTML into the DOM
											
			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);

			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});
			fieldsArr[0].focus();
		},
		
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = "inc" : type = "exp";
			
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumbers(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumbers(obj.totalInc, "inc");
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumbers(obj.totalExp, "exp");
			
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + " %";
			} 
			else {
				document.querySelector(DOMstrings.percentageLabel).textContent = "---";
			}
		},

		displayPercentages: function(percentage) {

			var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);

			nodeListForEach(fields, function(current, index) {
				if (percentage[index] > 0)
					current.textContent = percentage[index] + "%";
				else {
					current.textContent = "---";
				}
			});
		},

		displayDate: function() {
			var now, year, month, months
			now = new Date();
		  	// var christmass = new Date(2018, 12, 24)
			months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		  	month = now.getMonth();
		  	year = now.getFullYear();

		  	document.querySelector(".budget__title--month").textContent = months[month] + " " + year;

		},
		changedType: function() {

			var fields = document.querySelectorAll(
				DOMstrings.inputType + ", " +
				DOMstrings.inputDescription + ", " + 
				DOMstrings.inputValue
			);

			nodeListForEach(fields, function(cur) {
				cur.classList.toggle("red-focus");
			});
			
			document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
		},

		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
	// initialization
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

		document.addEventListener("keypress", function(event) {
		if (event.keyCode === 13 || event.which === 13) {
			ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener("click", ctrlDelete);

		document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);

		// CURRENCY TRIGGER
		document.querySelector(DOM.inputCurrency).addEventListener("change", changeCurrency);
	};

	var iterateItems = function(type, dataArray){
		var array = document.querySelectorAll('.' + type + ' .item__value');
		array.forEach((curr, index) =>  {
			curr.textContent = dataArray[index]; //formatNumbers(num, type)
		});
	}

	var firstCurr = document.querySelector(".add__currency").value;

		var updateItemsCurrency = function(){
			// getting inc and exp values 
			var dataInc = budgetCtrl.getItemsArray('inc');
			var dataExp = budgetCtrl.getItemsArray('exp');
			console.log(dataInc);
			console.log(dataExp);

			// getting the value fields
			
			iterateItems('income', dataInc);
			iterateItems('expenses', dataExp);

		}


		var changeCurrency = function(event){
    		var rateArr = [];
    		rateArr.push(firstCurr);
    		//window.r = rateArr;
			// 1. UI get currency types (preceding / new)
    		//console.log(rateArr[0]);
    		rateArr.push(event.target.value);
    		firstCurr = rateArr[1];
    		
    		console.log(rateArr[1]);
			//console.log(firstCurr);
			// 2. calc new values in Budget
			budgetCtrl.calcNewCurrValues(String(rateArr[0]), String(rateArr[1]));
			// 3. update UI
			updateBudget();
			// 4. update UI items
			updateItemsCurrency()

		};

	// 2nd part of controller
	var updateBudget = function() {
		// 1.) Calculate the budget
		budgetCtrl.calculateBudget();
		// 2.) Return the budget
		var budget = budgetCtrl.getBudget();
		// 3.) Display the budget on the UI
		UICtrl.displayBudget(budget);
	};
	
	// 3rd part of controller
	var updatePercentages = function() {
		// 1.) calculate %'s
		budgetCtrl.calculatePercentages();
		// 2.) read the actual percentage from budegtCTrl
		var percs = budgetCtrl.getPercentages();
		// 3.) display the % in the UI
		UICtrl.displayPercentages(percs);
	};

	// 1st part of controller
	var ctrlAddItem = function() {
		var input, newItem;
		// 1.) Get the filled input data
		// ITT VEZETJÜK ÁT A UI-ból
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// --- above ----- 2.) Add the item to the budget controller
			// ÁTVEZETÉS A BUDGET-BÓl
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3.) Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4.) Clear the fields
			UICtrl.clearFields();	

			// 5.) Calculate and update the budget
			updateBudget();

			// 6.) Calculate & display the percentages
			updatePercentages();
		}
	};

	var ctrlDelete = function(event) {
		var itemID, splitID

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		splitID = itemID.split("-");
		type = splitID[0];
		ID = parseFloat(splitID[1]);

		// 1.) Delete item from budgetCtrl
		budgetCtrl.deleteItem(type, ID);
		// 2.) Delete it from UI
		UICtrl.deleteListItem(itemID);
		// 3.) Update the budget
		updateBudget();
		// 4.) Calculate & update perc
		updatePercentages();
	};

	return {
		init: function() {
			setupEventListeners();
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0 
			});
			console.log("Application Has Started!")
		}
	}
})(budgetController, UIController);

controller.init();