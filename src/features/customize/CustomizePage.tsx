/**
 * Dashboard Settings page: choose, reorder (drag & drop) and style the home-dashboard widgets.
 */

import { useState, type DragEvent } from 'react'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'
import type { ChartStyle, Page, WidgetId, WidgetSize } from '../../shared/types'
import { defaultWidgets, essential, widgetLabels } from '../dashboard/widget-config'

/**
 * Dashboard settings.
 *
 * Edits a draft of the layout; the draft is applied to the app state on save.
 */
export function CustomizePage({
  widgets,
  setWidgets,
  go,
  chart,
  setChart,
  size,
  setSize,
}: {
  widgets: WidgetId[]
  setWidgets: (items: WidgetId[]) => void
  go: (page: Page) => void
  chart: ChartStyle
  setChart: (value: ChartStyle) => void
  size: WidgetSize
  setSize: (value: WidgetSize) => void
}) {
  const [draft, setDraft] = useState(widgets)
  const [saved, setSaved] = useState(false)
  const [draftChart, setDraftChart] = useState<ChartStyle>(chart)
  const [draftSize, setDraftSize] = useState<WidgetSize>(size)
  const [dragged, setDragged] = useState<WidgetId | null>(null)
  const move = (from: WidgetId, to: WidgetId) => {
    const next = [...draft]
    const fromIndex = next.indexOf(from)
    const toIndex = next.indexOf(to)
    next.splice(fromIndex, 1)
    next.splice(toIndex, 0, from)
    setDraft(next)
  }
  const drop = (event: DragEvent, to: WidgetId) => {
    event.preventDefault()
    if (dragged && dragged !== to) move(dragged, to)
    setDragged(null)
  }
  const optional = ['status', 'abnormalities', 'activity', 'cabin'] as WidgetId[]
  const reset = () => {
    setDraft(defaultWidgets)
    setDraftChart('Line')
    setDraftSize('Medium')
  }
  return (
    <>
      <PageTitle
        kicker="PERSONAL WORKSPACE"
        title="Dashboard Customization"
        description="Arrange the home dashboard around your mission workflow. Essential health indicators remain visible."
        action={
          <div className="title-actions">
            <button className="secondary-button" onClick={reset}>
              Reset default
            </button>
            <button
              className="primary-button"
              onClick={() => {
                setWidgets(draft)
                setChart(draftChart)
                setSize(draftSize)
                setSaved(true)
                setTimeout(() => go('Dashboard'), 500)
              }}
            >
              {saved ? 'Layout saved' : 'Save layout'}
            </button>
          </div>
        }
      />
      <div className="customize-layout">
        <section className="custom-canvas">
          <div className="custom-toolbar">
            <div>
              <span className="live-dot" />
              Dashboard preview
            </div>
            <span>Drag to rearrange · select size where available</span>
          </div>
          <div className="custom-grid">
            {draft.map((id) => (
              <article
                draggable
                onDragStart={() => setDragged(id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => drop(e, id)}
                className={`custom-widget ${essential.includes(id) ? 'essential' : ''}`}
                key={id}
              >
                <span className="grip">
                  <Icon name="grip" size={17} />
                </span>
                <div>
                  <span>{essential.includes(id) ? 'ESSENTIAL' : 'OPTIONAL'}</span>
                  <h3>{widgetLabels[id]}</h3>
                  <p>
                    {id === 'sleep' || id === 'heart' || id === 'cognitive'
                      ? `${chart} chart · Medium`
                      : 'Compact summary'}
                  </p>
                </div>
                {essential.includes(id) ? (
                  <Icon name="lock" size={14} />
                ) : (
                  <button onClick={() => setDraft(draft.filter((item) => item !== id))}>
                    Remove
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
        <aside className="custom-controls">
          <section>
            <span className="eyebrow">ADD WIDGETS</span>
            <h3>Widget library</h3>
            {optional.map((id) => {
              const added = draft.includes(id)
              return (
                <button disabled={added} onClick={() => setDraft([...draft, id])} key={id}>
                  <div>
                    <b>{widgetLabels[id]}</b>
                    <span>{added ? 'Added to dashboard' : 'Optional module'}</span>
                  </div>
                  {added ? <Icon name="check" size={15} /> : <Icon name="plus" size={15} />}
                </button>
              )
            })}
          </section>
          <section>
            <span className="eyebrow">CHART STYLE</span>
            <h3>Default visualization</h3>
            <div className="chart-options">
              {(['Line', 'Bars', 'Area'] as ChartStyle[]).map((item) => (
                <button
                  className={draftChart === item ? 'active' : ''}
                  onClick={() => setDraftChart(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <p>Applies to compatible trend widgets after saving.</p>
          </section>
          <section>
            <span className="eyebrow">WIDGET SIZE</span>
            <h3>Compatible health modules</h3>
            <div className="size-options">
              {(['Compact', 'Medium', 'Wide'] as WidgetSize[]).map((item) => (
                <button
                  className={draftSize === item ? 'active' : ''}
                  onClick={() => setDraftSize(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <p>Changes the density of primary dashboard widgets.</p>
          </section>
        </aside>
      </div>
    </>
  )
}
