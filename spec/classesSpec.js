var selenium = require('selenium-webdriver');
var By = selenium.By;
var until = selenium.until;

function scrollToNameInList(driver, name) {
	driver.executeScript("$(\'body\').scrollTop($(\'tr:contains(\"" + name + "\")\').offset().top);");
}

function addClass(driver, name, location, max) {
	var addClass = driver.findElement(By.className("addClassButtonModal"));
	addClass.click();
	var nameInput = driver.findElement(By.id("name"));
	driver.wait(until.elementIsVisible(nameInput));
	//send keys is unreliable for some reason
	driver.executeScript("$(\'#name\').val(\"" + name + "\");");
	driver.executeScript("$(\'#location\').val(\"" + location + "\");");
	driver.executeScript("$(\'#max\').val(\"" + max + "\");");
	var addClassButton = driver.findElement(By.className("addClassButton"));
	addClassButton.click();
}

function addClassWait(driver, name, location, max) {
	addClass(driver, name, location, max);
	var backdrop = driver.findElement(By.className("modal-backdrop"));
	driver.wait(until.stalenessOf(backdrop));
}

function removeClass(driver, name) {
	driver.executeScript("$(\'tr:contains(\"" + name + "\") > td > .glyphicon-remove\').click();");
	driver.executeScript("$(window).scrollTop(0);");
	var removeClass = driver.findElement(By.className("actuallyRemoveClass"));
	driver.wait(until.elementIsVisible(removeClass));
	removeClass.click();
}

function editClass(driver, oldname, name, location, max) {
	driver.executeScript("$(\'tr:contains(\"" + oldname + "\") > td > .glyphicon-pencil\').click();");
	var nameInput = driver.findElement(By.id("editNewName"));
	driver.wait(until.elementIsVisible(nameInput));
	driver.executeScript("$(\'#editNewName\').val(\"" + name + "\");");
	driver.executeScript("$(\'#editLocation\').val(\"" + location + "\");");
	driver.executeScript("$(\'#editMax\').val(\"" + max + "\");");
	var editInput = driver.findElement(By.className("editClassButton"));
	editInput.click();
}

function editClassWait(driver, oldname, name, location, max) {
	editClass(driver, oldname, name, location, max);
	var backdrop = driver.findElement(By.className("modal-backdrop"));
	driver.wait(until.stalenessOf(backdrop));
}

describe("classes list", function() {

	beforeEach(function (done) {
		this.driver = new selenium.Builder()
		.withCapabilities(selenium.Capabilities.chrome())
		.build();
		this.driver.get('http://localhost:3000/');
		var userName = this.driver.findElement(By.className("usernameForm"));
		userName.sendKeys("test");
		var password = this.driver.findElement(By.className("passwordForm"));
		password.sendKeys("test");
		var signIn = this.driver.findElement(By.className("signinButton"));
		signIn.click();
		this.driver.wait(until.elementLocated(By.className('itemData')), 10000);
		var classLink = this.driver.findElement(By.linkText("Classes"));
		classLink.click();
		this.driver.wait(until.elementLocated(By.className("navbar")));
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000
		done();

	});

	afterEach(function (done) {
		var signOut = this.driver.findElement(By.className("signOut"));
		signOut.click();
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
		this.driver.quit().then(done);
	});

	it('add delete class', function (done) {
		var driver = this.driver;
		addClassWait(driver, "test name", "test location", 5);
		scrollToNameInList(driver, "test name");
		removeClass(driver, "test name");
		done();
	});

	it('add class twice', function (done) {
		var driver = this.driver;
		addClassWait(driver, "test name", "test location", 5);
		addClass(driver, "test name", "test location", 5);
		driver.wait(until.alertIsPresent());
		driver.switchTo().alert().accept();
		scrollToNameInList(driver, "test name");
		removeClass(driver, "test name");
		done();
	});

	it('edit class', function (done) {
		var driver = this.driver;
		addClassWait(driver, "test name", "test location", 5);
		scrollToNameInList(driver, "test name");
		editClassWait(driver, "test name", "new test name", "new test location", 10);
		removeClass(driver, "new test name");
		done();
	});
});