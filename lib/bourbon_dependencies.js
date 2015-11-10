'use strict';

var bourbon = require('node-bourbon');
var fs = require('fs-extra');
var path = require('path');
var versionMap = require('./version_map');

var formatPath = function(filePath) {
	return filePath.replace(/\\/g, '/');
};

exports.createBourbonFile = function(forceCreation) {
	var bourbonPath = bourbon.includePaths[0];

	var tmpDirPath = path.join(__dirname, '../tmp');

	if (!fs.existsSync(tmpDirPath)) {
		fs.mkdirSync(tmpDirPath);
	}

	var bourbonFilePath = path.join(__dirname, '../tmp/_bourbon.scss');

	if (!fs.existsSync(bourbonFilePath) || forceCreation) {
		var bourbonFile = [];

		var deprecatedMixinsFilePath = path.join(__dirname, '../tmp/_deprecated.scss');

		if (fs.existsSync(deprecatedMixinsFilePath)) {
			bourbonFile.push('@import "');
			bourbonFile.push(formatPath(deprecatedMixinsFilePath));
			bourbonFile.push('";');
		}

		bourbonFile.push('@import "');
		bourbonFile.push(formatPath(path.join(bourbonPath, 'bourbon')));
		bourbonFile.push('";');
		bourbonFile.push('@import "');
		bourbonFile.push(formatPath(path.join(__dirname, '../node_modules', versionMap.getDependencyName('mixins'), 'liferay/_bourbon_ext')));
		bourbonFile.push('";');

		fs.writeFileSync(bourbonFilePath, bourbonFile.join(''));
	}

	return tmpDirPath;
};
