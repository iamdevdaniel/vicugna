const fs = require("node:fs/promises")
const path = require("node:path")
const {
	withAppBuildGradle,
	withDangerousMod,
	withProjectBuildGradle,
} = require("@expo/config-plugins")
const {
	mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode")

const detoxVersion = require("detox/package.json").version

function addGeneratedBlock(contents, options) {
	return mergeContents({
		src: contents,
		comment: "//",
		...options,
	}).contents
}

function withDetoxRepository(config) {
	return withProjectBuildGradle(config, (currentConfig) => {
		const projectRoot = currentConfig.modRequest.projectRoot
		const androidRoot = path.join(projectRoot, "android")
		const detoxRoot = path.dirname(
			require.resolve("detox/package.json", { paths: [projectRoot] }),
		)
		const repositoryPath = path
			.relative(androidRoot, path.join(detoxRoot, "Detox-android"))
			.split(path.sep)
			.join("/")

		currentConfig.modResults.contents = addGeneratedBlock(
			currentConfig.modResults.contents,
			{
				tag: "detox-maven-repository",
				anchor: /^allprojects\s*\{$/m,
				offset: 2,
				newSrc: `    maven { url("$rootDir/${repositoryPath}") }`,
			},
		)
		return currentConfig
	})
}

function withDetoxGradle(config) {
	return withAppBuildGradle(config, (currentConfig) => {
		let contents = addGeneratedBlock(currentConfig.modResults.contents, {
			tag: "detox-android-config",
			anchor: /^\s*defaultConfig\s*\{$/m,
			offset: 1,
			newSrc: [
				"        testBuildType System.getProperty('testBuildType', 'debug')",
				"        testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'",
			].join("\n"),
		})
		contents = addGeneratedBlock(contents, {
			tag: "detox-android-dependency",
			anchor: /^dependencies\s*\{$/m,
			offset: 1,
			newSrc: `    androidTestImplementation("com.wix:detox:${detoxVersion}")`,
		})
		currentConfig.modResults.contents = contents
		return currentConfig
	})
}

function withDetoxTest(config) {
	return withDangerousMod(config, [
		"android",
		async (currentConfig) => {
			const packageName = currentConfig.android?.package
			if (!packageName)
				throw new Error("Android package name is required")

			const packagePath = packageName.replaceAll(".", path.sep)
			const testDirectory = path.join(
				currentConfig.modRequest.projectRoot,
				"android/app/src/androidTest/java",
				packagePath,
			)
			await fs.mkdir(testDirectory, { recursive: true })
			await fs.writeFile(
				path.join(testDirectory, "DetoxTest.java"),
				`package ${packageName};

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

import com.wix.detox.Detox;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    @Rule
    public ActivityTestRule<MainActivity> activityRule =
        new ActivityTestRule<>(MainActivity.class, false, false);

    @Test
    public void runDetoxTests() {
        Detox.runTests(activityRule);
    }
}
`,
			)
			return currentConfig
		},
	])
}

module.exports = (config) =>
	withDetoxTest(withDetoxGradle(withDetoxRepository(config)))
