//
// I take a lot of screenshots on iOS.
// (I am hoping that in some version, those will be placed in a special folder)
// The screenshots are synced to Dropbox via "Camera Uploads"
// I want to automatically move the screenshots out of that folder and into
//

const UPLOADS_DIR = '/Users/dion/Dropbox (Personal)/Camera Uploads';
const SCREENSHOTS_DIR = '/Users/dion/Dropbox (Personal)/Screenshots/iOS Screenshots';

var fs = require('fs');
var exif = require('exif2');
var async = require('async');
var uploadsDirectory = process.argv[2] || UPLOADS_DIR; // TODO: optimist, allow for configurable screenshots dir too etc

// For each file in the Camera Uploads directory move over the iOS Screenshots
async.eachLimit(pngImagesInDir(uploadsDirectory), 20, moveIfScreenshot, function(err) {
  if (err) {
    console.log("eachLimit ERROR: ", err);
  }
});

// Given a directory, return the .png images from within
function pngImagesInDir(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return endsWith(file, '.png');
  });
}

// Given EXIF metadata, return if we think the associated image is an iOS Screenshot
function isScreenshot(exifData) {
  return exifData['image size'] == '640x1136';
}

// Given a image filename (and a callback for eachLimit) proceed to move anything that is an iOS screenshot
function moveIfScreenshot(file, callback) {
  var absoluteFile = imageInUploadsDirectory(file);

  exif(absoluteFile, function(err, obj) {
    if (err) {
      console.log("ERROR for ", absoluteFile, ": ", err);
      callback(err);
    } else if (isScreenshot(obj)) {
      moveScreenshotToItsHome(file);
    }
    callback();
  });
};

// Given an image filename try to move it to the screenshots directory
function moveScreenshotToItsHome(file) {
  var uploadsFile = imageInUploadsDirectory(file);
  var screenshotsFile = imageInScreenshotsDirectory(file);

  //console.log("Moved from ", uploadsFile, " to ", screenshotsFile);

  fs.rename(uploadsFile, screenshotsFile, function(err) {
    if (err) {
      console.log("ERROR for ", file, ":", err);
    } else {
      console.log("Moved from ", uploadsFile, " to ", screenshotsFile);
    }
  });
}

// beware slashes at the start of filename!
function imageInUploadsDirectory(file) {
  return UPLOADS_DIR + "/" + file;
}

function imageInScreenshotsDirectory(file) {
  return SCREENSHOTS_DIR + "/" + file;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
