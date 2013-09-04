/*
	Copyright (c) 2013 Oskenso Kashi <contact@oskenso.com>

	Permission is hereby granted, free of charge, to any person obtaining a
	copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
	THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	DEALINGS IN THE SOFTWARE.
*/

// Settings here should be modified
var host = 'http://e621.net/';
var username = "Oskenso";
var download_folder = 'images/';
var chunk_count = 20; // amount of chunks to download
var chunk_size = 20; // image files per chunk
var save_metadata = false; //TODO: if true, create metadata file and save it in folder :3

var https = require('https');
var fs = require('fs');

var files_downloaded = 0; //files downloaded

if ( ! fs.existsSync(download_folder)) {
	fs.mkdirSync(download_folder);
	console.log('"' + download_folder + '" folder created' +'\n');
}

var req_opt = {
	host: 'e621.net',
	port: 443,
	path: '',
	method: 'GET',
	headers: {
		'User-Agent': 'e621 Downloader v1'
	}
};

function getJson(opt, chunk_id, callback) {
	https.get(opt, function(res) {
		var data = '';
		
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			data += chunk;
		});
		
		res.on('end', function() {
			callback(JSON.parse(data), chunk_id);
		});
	});
}


function downloadFile(opt, file_path, callback) {
	var file = fs.createWriteStream(download_folder + file_path);
	
	var request = https.get(opt, function(res) {
		res.pipe(file).on('close', function() {
			callback(file_path);
		});
	});
}


// added recent http hack for e621's new json scheme :o
// TODO: impliment require('https') for https implementation
for (var x = 0; x < chunk_count; x++) {
	console.log('Chunk ' + x + ': Downloading image list.');
	var	opts = req_opt;
	opts.path = '/post/index.json?tags=fav:'+username+' order:score_desc -flash&page=45&limit=' + chunk_size + '&page='+x;
	getJson(opts, x, function(a, cid) {
	
		console.log('<' + 'Chunk ' + (cid + 1) + ': Image list downloaded.' + '>');
		//console.log('Chunk ' + cid + ': Images:');
		//for (l = 0; l < a.length; l++) {console.log('\t' + 'http' + a[l].file_url.substr(5));}
		//console.log('\n');
		
		for (i = 0; i < a.length; i++) {
			
			var filename = a[i].file_url.substr(a[i].file_url.lastIndexOf("/") + 1);
			var opts = req_opt;
			opts.path = a[i].file_url;
			
			downloadFile(opts, filename, function(fp) {
				files_downloaded++;
				console.log('"' + fp + '" saved. ' + files_downloaded + '/' + (chunk_count * chunk_size) +' downloaded.');
			});
		}
	});
}
