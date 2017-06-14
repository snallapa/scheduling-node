var selenium = require('selenium-webdriver');
var By = selenium.By;
var until = selenium.until;


function scrollToNameInList(driver, name) {
	driver.executeScript("$(\'.listView\').scrollTop($(\'.itemData:contains(\"" + name + "\")\').offset().top);");
	driver.executeScript("$('.itemData:contains(\"" + name + "\")').click();");
}

function addParticipant(driver, name) {
	var addLink = driver.findElement(By.className("addLink"));
	addLink.click();
	var input = driver.findElement(By.id("name"));
	driver.wait(until.elementIsVisible(input));
	input.sendKeys(name);
	var addButton = driver.findElement(By.className("addParticipantButton"));
	addButton.click();
	var backdrop = driver.findElement(By.className("modal-backdrop"));
	driver.wait(until.stalenessOf(backdrop));
}

function removeCurrentParticipant(driver) {
	driver.executeScript("$('.removeAction').click();");
	var actuallyRemove = driver.findElement(By.className("actuallyRemoveParticipant"));
	driver.wait(until.elementIsVisible(actuallyRemove));
	actuallyRemove.click();
	driver.wait(until.elementIsNotVisible(actuallyRemove));
}

describe("scheduling list", function() {

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
		this.driver.getCurrentUrl();
		this.driver.wait(until.elementLocated(By.className('itemData')), 10000);
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000
		done();

	});

	afterEach(function (done) {
		var signOut = this.driver.findElement(By.className("signOut"));
		signOut.click();
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
		this.driver.quit().then(done);
	});

	it('add and remove participant', function (done) {
		var driver = this.driver
		addParticipant(driver, "test name");
		var list = driver.findElement(By.className("listView"));
		scrollToNameInList(driver, "test name");
		var currentItem = list.findElement(By.className("active"));
		currentItem.getAttribute("textContent").then(function (text) {
			expect(text).toContain("test name");
			removeCurrentParticipant(driver);
			done();
		});
	});

	it('edit participant', function (done) {
		var driver = this.driver
		addParticipant(driver, "test name");
		var list = driver.findElement(By.className("listView"));
		scrollToNameInList(driver, "test name");
		var currentItem = list.findElement(By.className("active"));
		currentItem.getAttribute("textContent").then(function (text) {
			expect(text).toContain("test name");
			driver.executeScript("$('.editAction').click();");
			var editInput = driver.findElement(By.id("newParticipantName"));
			driver.wait(until.elementIsVisible(editInput));
			editInput.clear();
			editInput.sendKeys("test name edited");
			var editSubmit = driver.findElement(By.className("editParticipantButton"));
			editSubmit.click();
			list = driver.findElement(By.className("listView"));
			currentItem = list.findElement(By.className("active"));
			return currentItem.getAttribute("textContent");
		}).then(function (newText) {
			expect(newText).toContain("test name edited");
			removeCurrentParticipant(driver);
			done();
		});
	});

	it('add participant twice', function (done) {
		var driver = this.driver;
		addParticipant(driver, "test name");
		var addLink = driver.findElement(By.className("addLink"));
		addLink.click();
		var input = driver.findElement(By.id("name"));
		driver.wait(until.elementIsVisible(input));
		input.sendKeys("test name");
		var addButton = driver.findElement(By.className("addParticipantButton"));
		addButton.click();
		driver.wait(until.alertIsPresent());
		driver.switchTo().alert().accept();
		scrollToNameInList(driver, "test name");
		removeCurrentParticipant(driver, "test name");
		done();
	});
});