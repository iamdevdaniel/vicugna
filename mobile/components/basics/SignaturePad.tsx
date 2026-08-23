import type { SkPath } from "@shopify/react-native-skia"
import { Canvas, Group, Path, Skia } from "@shopify/react-native-skia"
import { useEffect, useMemo, useRef, useState } from "react"
import { View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { IconButton, useTheme } from "react-native-paper"

type SignaturePadProps = {
	value: string
	onChange: (value: string) => void
	disabled?: boolean
}

type PathEntry = { id: string; path: SkPath }

function parseSignature(value: string): PathEntry[] {
	if (!value) return []

	try {
		const svgStrings: string[] = JSON.parse(value)
		return svgStrings
			.map((svg) => Skia.Path.MakeFromSVGString(svg))
			.filter((path): path is SkPath => path !== null)
			.map((path, index) => ({ id: `signature-path-${index}`, path }))
	} catch {
		return []
	}
}

export function SignaturePreview({ value }: { value: string }) {
	const theme = useTheme()
	const paths = useMemo(() => parseSignature(value), [value])
	const [width, setWidth] = useState(0)
	const scale = width / 320

	return (
		<View
			onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
			style={{
				borderWidth: 1,
				borderColor: theme.colors.outlineVariant,
				borderRadius: 4,
				overflow: "hidden",
			}}
		>
			<Canvas
				style={{
					width: "100%",
					aspectRatio: 3.2,
					backgroundColor: "white",
				}}
			>
				<Group transform={[{ scale }]}>
					{paths.map(({ id, path }) => (
						<Path
							key={id}
							path={path}
							strokeWidth={2}
							color="black"
							style="stroke"
							strokeJoin="round"
							strokeCap="round"
						/>
					))}
				</Group>
			</Canvas>
		</View>
	)
}

export function SignaturePad({
	value,
	onChange,
	disabled = false,
}: SignaturePadProps) {
	const theme = useTheme()
	const [completedPaths, setCompletedPaths] = useState<PathEntry[]>([])
	const currentPathRef = useRef<SkPath | null>(null)
	const [, setTick] = useState(0)
	// Track the last value we serialized ourselves so we don't re-parse our own onChange calls
	const lastEmittedRef = useRef<string>("")

	useEffect(() => {
		// Skip if this value was just emitted by us (drawing/clearing)
		if (value === lastEmittedRef.current) return
		if (!value) {
			setCompletedPaths([])
			return
		}
		setCompletedPaths(parseSignature(value))
	}, [value])

	const gesture = Gesture.Pan()
		.runOnJS(true)
		.minDistance(0)
		.onStart(({ x, y }) => {
			const p = Skia.Path.Make()
			p.moveTo(x, y)
			currentPathRef.current = p
			setTick((n) => n + 1)
		})
		.onUpdate(({ x, y }) => {
			currentPathRef.current?.lineTo(x, y)
			setTick((n) => n + 1)
		})
		.onEnd(() => {
			const p = currentPathRef.current
			if (p) {
				const entry: PathEntry = {
					id: Math.random().toString(36).substring(7),
					path: p,
				}
				const next = [...completedPaths, entry]
				setCompletedPaths(next)
				currentPathRef.current = null
				const serialized = JSON.stringify(
					next.map((e) => e.path.toSVGString()),
				)
				lastEmittedRef.current = serialized
				onChange(serialized)
			}
		})

	const handleClear = () => {
		setCompletedPaths([])
		currentPathRef.current = null
		lastEmittedRef.current = ""
		onChange("")
	}

	return (
		<View
			style={{
				borderWidth: 1,
				borderColor: theme.colors.outline,
				borderRadius: 4,
				overflow: "hidden",
				opacity: disabled ? 0.6 : 1,
			}}
		>
			<GestureDetector
				gesture={disabled ? Gesture.Pan().enabled(false) : gesture}
			>
				<Canvas
					style={{
						width: "100%",
						aspectRatio: 3.2,
						backgroundColor: "white",
					}}
				>
					{completedPaths.map((e) => (
						<Path
							key={`path-${e.id}`}
							path={e.path}
							strokeWidth={2}
							color="black"
							style="stroke"
							strokeJoin="round"
							strokeCap="round"
						/>
					))}
					{currentPathRef.current !== null && (
						<Path
							key="active-drawing-path"
							path={currentPathRef.current}
							strokeWidth={2}
							color="black"
							style="stroke"
							strokeJoin="round"
							strokeCap="round"
						/>
					)}
				</Canvas>
			</GestureDetector>
			<IconButton
				icon="eraser"
				size={18}
				mode="contained"
				style={{ position: "absolute", top: 4, right: 4, margin: 0 }}
				onPress={handleClear}
				disabled={disabled}
			/>
		</View>
	)
}
