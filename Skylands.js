// script.name=Skylands - ctRy
// script.description=Carves out the ground to make floating islands.
//
// script.param.image.type=file
// script.param.image.description=Heightmap. Leave blank to remove all skyland layers.
// script.param.image.displayName=Sky heightmap
// script.param.image.optional=true
//
// script.param.bit.type=boolean
// script.param.bit.description=check for 16 bit images, uncheck for 8 bit images
// script.param.bit.displayName=16 bit heightmap
// script.param.bit.default=true
//
// script.param.flip.type=boolean
// script.param.flip.description=check to measure height from surface (relative), uncheck to measure height from 0 (absolute)
// script.param.flip.displayName=Flip height
// script.param.flip.default=false
//
// script.param.coordx.type=integer
// script.param.coordx.description=how much should the mask be shifted in the x direction (top left corner)
// script.param.coordx.displayName=x shift
// script.param.coordx.default=0
//
// script.param.coordy.type=integer
// script.param.coordy.description=how much should the mask be shifted in the y direction (top left corner)
// script.param.coordy.displayName=y shift
// script.param.coordy.default=0
// script.hideCmdLineParams=true

//where _sky folder is located
var path = org.pepsoft.worldpainter.Configuration.getConfigDir().getAbsolutePath() + "\\plugins\\_sky\\";

///////////CODE/////////////

print('Script by ctRy');

if (params["image"] != null)
{
	var underHeight = wp.getHeightMap().fromFile(params["image"].getAbsolutePath()).go();

	var xMin = params["coordx"];
	var yMin = params["coordy"];

	print("Initializing layers . . .");
	var layers = [];
	for (var i = 0; i < 256; i++)
		layers[i] = null;

	var voidLayer = wp.getLayer().withName('Void').go();

	var multiplier = 1; //8 bit
	if (params["bit"])
		multiplier = 1.0 / 256.0; //16 bit

	var extent = underHeight.getExtent();

	print("Applying layers . . .");
	for (var x = extent.getX(); x < extent.getWidth(); x++)
	{
	    for (var y = extent.getY(); y < extent.getHeight(); y++)
	    {
			if (!dimension.isTilePresent(truncate((x + xMin) / 128.0), truncate((y + yMin) / 128.0) ))
				continue;

			var height = Math.round(underHeight.getHeight(x, y) * multiplier);
			if (params["flip"])
				height = Math.round(dimension.getHeightAt(x + xMin, y + yMin) - underHeight.getHeight(x, y) * multiplier);
			
			if (height >= dimension.getHeightAt(x + xMin, y + yMin))
				dimension.setBitLayerValueAt(voidLayer, x + xMin, y + yMin, true);
			else if (height >= 0)
			{
				if (layers[height] == null)
				{
					layers[height] = wp.getLayer().fromFile(path + height + ".layer").go();
					layers[height].setHide(true);
				}

				dimension.setBitLayerValueAt(layers[height], x + xMin, y + yMin, true);
			}


	    }
	}

	dimension.setBottomless(true);
}
else
{
	print("Deleting . . .");

	var voidLayer = wp.getLayer().withName('Void').go();
	var layers = [];
	for (var i = 0; i < 256; i++)
		layers[i] = wp.getLayer().fromFile(path + i + ".layer").go();

	var rect = dimension.getExtent();
	for (var x = rect.getX() * 128; x < rect.getWidth() * 128; x++)
	{
	    for (var y = rect.getY() * 128; y < rect.getHeight() * 128; y++)
	    {
	    	if (dimension.getBitLayerValueAt(voidLayer, x, y))
			{
				dimension.setBitLayerValueAt(voidLayer, x, y, false);
				continue;
			}
			
			for (var i = 0; i < 256; i++)
			{
				if (dimension.getBitLayerValueAt(layers[i], x, y))
				{
					dimension.setBitLayerValueAt(layers[i], x, y, false);
					break;
				}
			}

	    }
	}

}

print("Done! :D");

function truncate(number)
{
    return number > 0
         ? Math.floor(number)
         : Math.ceil(number);
}