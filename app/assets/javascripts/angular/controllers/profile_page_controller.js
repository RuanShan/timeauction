var app = angular.module('timeauction');

app.controller('ProfilePageCtrl', ['$scope', 'Users', function($scope, Users) {
  $scope.showAboutInput = false
  $scope.volunteerSection = true
  $(".tabs-sections-holder").show()

  $scope.toggleAboutInput = function() {
    $(".about-me-input-holder").toggle()
  }

  $scope.toggleHoursCount = function() {
    $(".hours-count-details-holder").toggle()
  }

  $scope.saveAbout = function() {
    var url = $(".about-me-input-holder").attr("data-url")
    var text = $(".about-me-input").val()
    Users.saveAbout(url, text)
    updateAboutText(text)
  }

  function updateAboutText(text) {
    $scope.toggleAboutInput()
    if (text == "") {
      text = $(".about-me-input-holder").attr("data-empty-text")
    }
    $(".about-me-text").html(Users.makeIntoParagraphs(text))
  }

  $scope.tabSelection = function(event) {
    var section = $(event.target).text()
    if (section == "Volunteering") {
      allSectionsFalse()
      $scope.volunteerSection = true
    } else if (section == "Donations") {
      allSectionsFalse()
      $scope.donationSection = true
    } else { // Bids
      allSectionsFalse()
      $scope.bidsSection = true
    }
  }

  function allSectionsFalse() {
    $scope.volunteerSection = false
    $scope.donationSection = false
    $scope.bidsSection = false
  }
}]);