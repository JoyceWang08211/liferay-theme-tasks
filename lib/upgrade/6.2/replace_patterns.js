'use strict';

var _ = require('lodash');

function getNonBlackListedMixins(mixins, blackList) {
	if (_.isPlainObject(mixins)) {
		mixins = _.keys(mixins);
	}

	mixins = _.reduce(mixins, function(result, item, index) {
		if (!_.contains(blackList, item)) {
			result.push(item);
		}

		return result;
	}, []);

	return mixins.join('|');
}

function getPatterns(blackList) {
	var functionBlackList = blackList.functions;
	var mixinsBlackList = blackList.mixins;

	var deprecatedMixins = getNonBlackListedMixins([
		'background-clip',
		'background-origin',
		'background-size',
		'border-radius',
		'box-shadow',
		'opacity',
		'single-box-shadow',
		'text-shadow'
	], mixinsBlackList);

	var deprecatedMixinRegExp = new RegExp('@include ((' + deprecatedMixins + ')\\((.*)\\));', 'g');

	var updatedMixinKeyValues = {
		'display-flex': 'display',
		'input-placeholder': 'placeholder',
		'word-break': 'word-wrap'
	};

	var updateMixinNames = getNonBlackListedMixins(updatedMixinKeyValues, mixinsBlackList);

	var updatedMixinNameRegExp = new RegExp('(@include )(' + updateMixinNames + ')(\\(.*\\);)', 'g');

	var alternativeMixinsKeyValues = {
		'opaque': 'opacity: 1;',
		'transparent': 'opacity: 0;'
	};

	var alternativeMixinNames = getNonBlackListedMixins(alternativeMixinsKeyValues, mixinsBlackList);

	var alternativeMixinRegExp = new RegExp('@include (' + alternativeMixinNames + ')\\(.*\\);', 'g');

	return [
		{
			match: /(@import ")compass(";)/g,
			replacement: '$1bourbon$2'
		},
		{
			match: alternativeMixinRegExp,
			replacement: function(match, p1, p2, p3) {
				var alternativeValue = alternativeMixinsKeyValues[p1];

				return alternativeValue;
			}
		},
		{
			match: deprecatedMixinRegExp,
			replacement: function(match, p1, p2, p3) {
				return p2 + ': ' + p3 + ';';
			}
		},
		{
			match: updatedMixinNameRegExp,
			replacement: function(match, p1, p2, p3) {
				var updatedMixinName = updatedMixinKeyValues[p2];

				return p1 + updatedMixinName + p3;
			}
		}
	]
}

module.exports = getPatterns;