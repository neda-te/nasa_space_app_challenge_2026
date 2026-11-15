import { test, expect } from '@playwright/test'

const confirmation = 'The data has been sent to the flight surgeon.'
async function noPageOverflow(context) {
  const dimensions = await context.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1)
}
async function openEmergency(page) {
  await page.getByRole('button', { name: 'Help — open emergency mode' }).click()
  const frame = page.frameLocator('iframe')
  await expect(frame.locator('#s1')).toBeVisible()
  return frame
}
async function frameContext(page) {
  return page.frames().find((frame) => frame.url().includes('/emergency/'))
}
async function checkModel(frame) {
  await expect.poll(() => frame.evaluate(() => Math.abs(dist - tgtDist))).toBeLessThan(.002)
  const position = await frame.evaluate(() => {
    scene.updateMatrixWorld(true)
    camera.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(pivot)
    const points = []
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const point = new THREE.Vector3(x,y,z).project(camera)
      points.push({ x: point.x, y: point.y })
    }
    return {
      minX: Math.min(...points.map((p) => p.x)), maxX: Math.max(...points.map((p) => p.x)),
      minY: Math.min(...points.map((p) => p.y)), maxY: Math.max(...points.map((p) => p.y)),
      center: new THREE.Vector3(0,bodyLook,0).project(camera).toArray(),
    }
  })
  expect(position.minX).toBeGreaterThan(-.96)
  expect(position.maxX).toBeLessThan(.96)
  expect(position.minY).toBeGreaterThan(-.96)
  expect(position.maxY).toBeLessThan(.96)
  expect(Math.abs(position.center[0])).toBeLessThan(.005)
  expect(Math.abs(position.center[1])).toBeLessThan(.005)
}
async function painAssessment(page, frame) {
  await frame.locator('[data-action="type"][data-v="pain"]').click()
  await expect(frame.locator('#s2.on')).toBeVisible()
  const context = await frameContext(page)
  await checkModel(context)
  const point = await context.evaluate(() => {
    const mesh = pickables.find((mesh) => mesh.userData.region === 'chestL')
    const box = new THREE.Box3().setFromObject(mesh)
    const p = box.getCenter(new THREE.Vector3())
    p.z = box.max.z
    p.project(camera)
    const rect = document.querySelector('#gl').getBoundingClientRect()
    return { x: (p.x+1)/2*rect.width, y: (1-p.y)/2*rect.height }
  })
  await frame.locator('#gl').click({ position: point })
  await expect(frame.locator('#chips .chip')).toHaveCount(1)
  await frame.locator('[data-action="grp"][data-g="pos"]').first().click()
  await frame.locator('[data-action="grp"][data-g="kind"]').first().click()
  await expect(frame.locator('#next')).toBeEnabled()
  await frame.locator('#next').click()
  await expect(frame.locator('#s3')).toBeVisible()
}

test('dashboard opens directly, readable navigation and prototype tools remain usable', async ({ page }, info) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle('HEALium – Astronaut Health Monitoring')
  await expect(page.getByRole('heading', { name: 'HEALium', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in|log in|create account/i })).toHaveCount(0)
  await noPageOverflow(page)
  const fontSizes = await page.locator('.reminder-link, .primary-widget > p, .summary-column > span').evaluateAll((nodes) => nodes.map((node) => parseFloat(getComputedStyle(node).fontSize)))
  expect(Math.min(...fontSizes)).toBeGreaterThanOrEqual(12)
  const clipped = await page.locator('.reminder-grid article p,.task-copy small,.section-heading,.summary-column').evaluateAll((nodes) => nodes.filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1).map((node) => node.className))
  expect(clipped).toEqual([])
  await page.screenshot({ path: info.outputPath('dashboard.png'), fullPage: true })
  await page.getByRole('button', { name: 'Complete Scheduled blood test' }).click()
  await expect(page.getByRole('button', { name: 'Reopen Scheduled blood test' })).toHaveAttribute('aria-pressed','true')
  for (const name of ['Physical Health','Environmental Monitoring','Tests & Lab Data','Trends & Analysis','My Journal','Data Sources','Emergency Data','Dashboard Settings']) {
    await page.getByRole('navigation').getByRole('button',{name,exact:true}).click()
    await noPageOverflow(page)
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toHaveCount(0)
  }
  await page.goto('/login')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'HEALium', exact: true })).toBeVisible()
  await page.goto('/index.html?from=bookmark')
  await expect(page.getByRole('heading', { name: 'HEALium', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('3D body remains centered and fully visible after resize, rotate, zoom and return', async ({ page }, info) => {
  // Software WebGL screenshot capture can be slow on shared Windows runners.
  test.setTimeout(120000)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const crew = page.locator('.crew-selector select')
  await crew.selectOption('Dr. Elias Romero')
  const frame = await openEmergency(page)
  await noPageOverflow(await frameContext(page))
  await frame.locator('[data-action="type"][data-v="pain"]').click()
  await expect(frame.locator('#s2.on')).toBeVisible()
  const context = await frameContext(page)
  await checkModel(context)
  await frame.locator('[data-action="view"][data-v="back"]').click()
  await expect.poll(() => context.evaluate(() => Math.abs(rotY-tgtY))).toBeLessThan(.002)
  await checkModel(context)
  await frame.locator('[data-action="zoom"][data-v="head"]').click()
  await expect.poll(() => context.evaluate(() => Math.abs(dist-1))).toBeLessThan(.002)
  await frame.locator('[data-action="zoom"][data-v="body"]').click()
  await checkModel(context)
  const viewport = page.viewportSize()
  await page.setViewportSize({ width: viewport.width + 35, height: viewport.height + 40 })
  await checkModel(context)
  await frame.locator('.model-stage').scrollIntoViewIfNeeded()
  const bodyInViewport = await context.evaluate(() => {
    scene.updateMatrixWorld(true)
    camera.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(pivot)
    const rect = document.querySelector('#gl').getBoundingClientRect()
    const points = []
    for (const x of [box.min.x,box.max.x]) for (const y of [box.min.y,box.max.y]) for (const z of [box.min.z,box.max.z]) {
      const p = new THREE.Vector3(x,y,z).project(camera)
      points.push(rect.top+(1-p.y)/2*rect.height)
    }
    return { top: Math.min(...points), bottom: Math.max(...points), height: innerHeight }
  })
  expect(bodyInViewport.top).toBeGreaterThanOrEqual(0)
  expect(bodyInViewport.bottom).toBeLessThanOrEqual(bodyInViewport.height)
  await noPageOverflow(context)
  await page.screenshot({ path: info.outputPath('emergency-body.png') })
  await page.getByRole('button', { name: 'Back to dashboard' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(crew).toHaveValue('Dr. Elias Romero')
  expect(errors).toEqual([])
})

test('submission confirmation appears only after success and is explicitly simulated', async ({ page }, info) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const frame = await openEmergency(page)
  await expect(frame.getByText(confirmation,{exact:true})).toHaveCount(0)
  await painAssessment(page,frame)
  const context = await frameContext(page)
  await noPageOverflow(context)
  // Inject a failed service response to prove that failure cannot show success.
  await context.evaluate(() => { window.realSubmit = submitEmergencyData; submitEmergencyData = async () => ({ok:false}) })
  await frame.locator('#sendReport').click()
  await expect(frame.locator('#submissionStatus')).toHaveText('The data could not be sent. Please try again.')
  await expect(frame.getByText(confirmation,{exact:true})).toHaveCount(0)
  await context.evaluate(() => { submitEmergencyData = window.realSubmit })
  await frame.locator('#sendReport').click()
  await expect(frame.getByText(confirmation,{exact:true})).toBeVisible()
  await expect(frame.getByText(confirmation,{exact:true})).toBeInViewport()
  await expect(frame.locator('#submissionStatus')).toContainText('Simulation only · no data transmitted')
  await expect(frame.locator('#sendReport')).toBeDisabled()
  await page.screenshot({ path: info.outputPath('submission.png') })
  await frame.locator('#restart').click()
  await expect(frame.getByText(confirmation,{exact:true})).toHaveCount(0)
  await page.getByRole('button', { name: 'Back to dashboard' }).click()
  await page.getByRole('button', { name: 'Daily health assessment', exact: true }).click()
  await page.getByRole('button', { name: /Evening check-in/ }).click()
  await page.getByRole('button', { name: 'Submit check-in', exact: true }).click()
  await expect(page.getByText('Answer at least one item using the 1–5 scale.')).toBeVisible()
  await expect(page.getByText(confirmation,{exact:true})).toHaveCount(0)
  await page.locator('.evening-slider').first().getByRole('button',{name:'3',exact:true}).click()
  await page.getByRole('button', { name: 'Submit check-in', exact: true }).click()
  await expect(page.getByText(confirmation,{exact:true})).toBeVisible()
  await expect(page.getByText(confirmation,{exact:true})).toBeInViewport()
  await expect(page.locator('.submission-status')).toContainText('Simulation only · no data transmitted')
  await page.screenshot({ path: info.outputPath('checkin.png') })
  expect(errors).toEqual([])
})
