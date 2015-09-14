var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter.prototype;
var CHANGE_EVENT = 'CHANGE';

var storeMethods = {
	init: function () {},
	set: function (arr) {
		var currIds = this._data.map(function (m) { return m.cid; });

		arr.filter(function (item) {
			return currIds.indexOf(item.cid) === -1;
		}).forEach(this.add.bind(this));

	},
	add: function (item) {
		this._data.push(item);
	},
	all: function () {
		return this._data;
	},
	get: function (id) {
		return this._data.filter(function (item) {
			return item.cid === id;
		})[0];
	},
	addChangeListener: function (fn) {
		this.on(CHANGE_EVENT, fn);
	},
	removeChangeListener: function (fn) {
		this.removeListener(CHANGE_EVENT, fn);
	}, 
	emitChange: function () {
		this.emit(CHANGE_EVENT);
	},
	bind: function (actionType, actionFn) {
		if (this.actions[actionType]) {
			this.actions[actionType].push(actionFn);
		} else {
			this.actions[actionType] = [actionFn];
		}
	}
};

exports.extend = function (methods) {
	var store = {
		_data: [],
		actions: {}
	};

	assign(store, EventEmitter, storeMethods, methods);

	store.init();

	require('../dispatcher').register(function (action) {
		if (store.actions[action.actionType]) {
			store.actions[action.actionType].forEach(function (fn) {
				fn.call(store, action.data);
			});
		}
	});

	return store;
};
