import { __ } from "@wordpress/i18n";
import {
  useBlockProps,
  InspectorControls,
  InnerBlocks,
} from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  SelectControl,
  Button,
  ButtonGroup,
  ToggleControl,
} from "@wordpress/components";
import { useState, useEffect, useRef } from "@wordpress/element";
import { useSelect, useDispatch } from "@wordpress/data";
import { desktop, tablet, mobile, reset } from "@wordpress/icons";
import "./editor.scss";

// Constants
const VIEWPORTS = {
  mobile: { icon: mobile, label: "Mobile", breakpoint: null },
  tablet: { icon: tablet, label: "Tablet", breakpoint: "600px" },
  desktop: { icon: desktop, label: "Desktop", breakpoint: "1024px" },
};

const PROPS = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "width",
  "height",
  "zIndex",
  "transform",
];

const EMPTY_VIEWPORT = Object.fromEntries(PROPS.map((p) => [p, ""]));

const toDeviceType = (viewport) =>
  viewport.charAt(0).toUpperCase() + viewport.slice(1);
const toViewport = (deviceType) => deviceType.toLowerCase();

const OPTIONS = {
  position: ["static", "relative", "absolute", "fixed", "sticky"],
};

// Field component - defined outside to prevent focus loss on re-render
const Field = ({
  label,
  value,
  onChange,
  isInherited,
  placeholder,
  type,
  options,
}) => {
  const commonProps = {
    label: __(label, "flexible-container"),
    value,
    onChange,
    className: isInherited ? "is-inherited" : "",
  };

  return type === "select" ? (
    <SelectControl {...commonProps} options={options} />
  ) : (
    <TextControl
      {...commonProps}
      placeholder={isInherited ? placeholder || "inherited" : ""}
    />
  );
};

export default function Edit({ attributes, setAttributes }) {
  const [activeViewport, setActiveViewport] = useState("desktop");
  const skipNextSync = useRef(false);

  // Get/set editor device preview
  const editorDeviceType = useSelect((select) => {
    const editPost = select("core/edit-post");
    if (editPost?.__experimentalGetPreviewDeviceType) {
      return editPost.__experimentalGetPreviewDeviceType();
    }
    return select("core/editor")?.getDeviceType?.() || "Desktop";
  }, []);

  const { __experimentalSetPreviewDeviceType: setEditPostDeviceType } =
    useDispatch("core/edit-post") || {};
  const { setDeviceType: setEditorDeviceType } =
    useDispatch("core/editor") || {};

  const syncEditorPreview = (viewport) => {
    const deviceType = toDeviceType(viewport);
    (setEditPostDeviceType || setEditorDeviceType)?.(deviceType);
  };

  // Sync tabs when editor preview changes
  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    const mapped = toViewport(editorDeviceType);
    if (mapped !== activeViewport) {
      setActiveViewport(mapped);
    }
  }, [editorDeviceType]);

  // Handle viewport tab click
  const handleViewportChange = (viewport) => {
    if (viewport === activeViewport) {
      skipNextSync.current = true;
      const issynced = editorDeviceType === toDeviceType(viewport);
      syncEditorPreview(issynced ? "desktop" : viewport);
    } else {
      setActiveViewport(viewport);
      syncEditorPreview(viewport);
    }
  };

  // Inheritance helpers
  const getInheritedValue = (key) => {
    if (activeViewport === "tablet") return attributes.mobile[key];
    if (activeViewport === "desktop")
      return attributes.tablet[key] || attributes.mobile[key];
    return "";
  };

  const getEffectiveValue = (key) => {
    return attributes[activeViewport][key] || getInheritedValue(key);
  };

  const hasOverride = (key) =>
    activeViewport === "mobile" || attributes[activeViewport][key] !== "";

  // Build select options with inheritance indicator
  const buildOptions = (type) => {
    const baseOptions = OPTIONS[type].map((v) => ({
      label: v.charAt(0).toUpperCase() + v.slice(1).replace("-", "-"),
      value: v,
    }));

    if (activeViewport === "mobile") {
      return [
        { label: __("Default", "flexible-container"), value: "" },
        ...baseOptions,
      ];
    }

    const inherited = getInheritedValue(type);
    const inheritLabel = inherited
      ? `↑ ${
          inherited.charAt(0).toUpperCase() + inherited.slice(1)
        } (inherited)`
      : __("↑ Default (inherited)", "flexible-container");

    return [{ label: inheritLabel, value: "" }, ...baseOptions];
  };

  // Build inline styles for preview
  const getInlineStyles = () => {
    return Object.fromEntries(
      PROPS.map((p) => [p, getEffectiveValue(p)]).filter(([, v]) => v),
    );
  };

  const viewportData = attributes[activeViewport];
  const updateAttr = (key, value) =>
    setAttributes({ [activeViewport]: { ...viewportData, [key]: value } });
  const viewportHasValues = (vp) =>
    Object.values(attributes[vp]).some((v) => v !== "");

  const blockProps = useBlockProps({
    className: "fc-block",
    style: getInlineStyles(),
  });

  // Helper to generate Field props
  const fieldProps = (prop, type, options) => ({
    value: viewportData[prop],
    onChange: (v) => updateAttr(prop, v),
    isInherited: !hasOverride(prop) && activeViewport !== "mobile",
    placeholder: getEffectiveValue(prop),
    type,
    options,
  });

  return (
    <>
      <InspectorControls>
        <PanelBody
          title={__("Responsive", "flexible-container")}
          initialOpen={true}
        >
          <div className="flexible-container-viewport-controls">
            <div className="flexible-container-viewport-tabs">
              <ButtonGroup>
                {Object.entries(VIEWPORTS).map(([key, { icon, label }]) => (
                  <Button
                    key={key}
                    icon={icon}
                    label={label}
                    isPressed={activeViewport === key}
                    onClick={() => handleViewportChange(key)}
                    className={viewportHasValues(key) ? "has-values" : ""}
                  />
                ))}
              </ButtonGroup>
            </div>
            <div className="flexible-container-viewport-label">
              {__("Editing:", "flexible-container")}{" "}
              <strong>{VIEWPORTS[activeViewport].label}</strong>
              {VIEWPORTS[activeViewport].breakpoint && (
                <span className="flexible-container-breakpoint">
                  {VIEWPORTS[activeViewport].breakpoint}
                </span>
              )}
              {viewportHasValues(activeViewport) && (
                <Button
                  icon={reset}
                  onClick={() =>
                    setAttributes({ [activeViewport]: EMPTY_VIEWPORT })
                  }
                  label={__("Reset all values", "flexible-container")}
                  isSmall
                  isDestructive
                  className="flexible-container-reset-btn"
                />
              )}
              {activeViewport !== "mobile" && (
                <div className="flexible-container-inheritance-note">
                  {activeViewport === "tablet" &&
                    __("Inherits from Mobile", "flexible-container")}
                  {activeViewport === "desktop" &&
                    __("Inherits from Tablet/Mobile", "flexible-container")}
                </div>
              )}
            </div>
          </div>
          <ToggleControl
            label={__("Hide on this viewport", "flexible-container")}
            checked={viewportData.display === "none"}
            onChange={(checked) => updateAttr("display", checked ? "none" : "")}
          />
        </PanelBody>

        <PanelBody title={__("Position", "flexible-container")}>
          <Field
            label="Position Type"
            {...fieldProps("position", "select", buildOptions("position"))}
          />
          {["relative", "absolute", "fixed", "sticky"].includes(
            getEffectiveValue("position"),
          ) && (
            <>
              <div className="fc-offset-grid">
                <label className="fc-offset-label">
                  {__("Offset", "flexible-container")}
                </label>
                {["top", "left", "right", "bottom"].map((side) => (
                  <div key={side} className={`fc-offset-${side}`}>
                    <input
                      type="text"
                      value={viewportData[side]}
                      onChange={(e) => updateAttr(side, e.target.value)}
                      placeholder={getInheritedValue(side) || side}
                      className={
                        !hasOverride(side) && activeViewport !== "mobile"
                          ? "is-inherited"
                          : ""
                      }
                    />
                  </div>
                ))}
                <div className="fc-offset-center">✛</div>
              </div>
              <Field label="Z-Index" {...fieldProps("zIndex")} />
            </>
          )}
          <Field label="Transform" {...fieldProps("transform")} />
        </PanelBody>

        <PanelBody
          title={__("Dimensions", "flexible-container")}
          initialOpen={true}
        >
          <Field label="Width" {...fieldProps("width")} />
          <Field label="Height" {...fieldProps("height")} />
        </PanelBody>

      </InspectorControls>

      <div {...blockProps}>
        <InnerBlocks />
      </div>
    </>
  );
}
