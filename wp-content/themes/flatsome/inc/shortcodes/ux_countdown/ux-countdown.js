Flatsome.behavior('ux-countdown', {
 attach: function (context) {
	jQuery('[data-countdown]', context).each(function () {
	 var $this = jQuery(this), finalDate = jQuery(this).data('countdown');

	 // Labels come from attributes and are rendered with .html(), so escape them as text.
	 var text = function (key) {
	   var value = $this.data(key);
	   return value == null ? '' : jQuery('<div>').text(String(value)).html();
	 };

	 var t_hour = text('text-hour'),
     t_min = text('text-min'),
     t_week = text('text-week'),
     t_day = text('text-day'),
     t_sec = text('text-sec'),
     t_min_p = text('text-min-p'),
     t_hour_p = text('text-hour-p'),
     t_week_p = text('text-week-p'),
     t_day_p = text('text-day-p'),
     t_sec_p = text('text-sec-p'),
     t_plural = text('text-plural');

     var hours_plural = t_hour+t_plural;
     var days_plural = t_day+t_plural;
     var weeks_plural = t_week+t_plural;
     var min_plural = t_min;
     var sec_plural = t_sec;

     if(t_hour_p) hours_plural = t_hour_p;
     if(t_min_p) min_plural = t_min_p;
     if(t_week_p) weeks_plural = t_week_p;
     if(t_day_p) days_plural = t_day_p;
     if(t_sec_p) sec_plural = t_sec_p;

		 $this.countdown(finalDate).on('update.countdown', function (event) {
		      var format = '<span>%-H<strong>%!H:'+t_hour+','+hours_plural+';</strong></span><span>%-M<strong>%!M:'+t_min+','+min_plural+';</strong></span><span>%-S<strong>%!S:'+t_sec+','+sec_plural+';</strong></span>';

          if(event.offset.days > 0) { format = '<span>%-d<strong>%!d:'+t_day+','+days_plural+';</strong></span>' + format; }
          if(event.offset.weeks > 0) { format = '<span>%-w<strong>%!w:'+t_week+','+weeks_plural+';</strong></span>' + format; }

			  jQuery(this).html(event.strftime(format));

		 }).on('finish.countdown', function (event) {
        var format = '<span>%-H<strong>%!H:'+t_hour+','+hours_plural+';</strong></span><span>%-M<strong>%!M:'+t_min+','+min_plural+';</strong></span><span>%-S<strong>%!S:'+t_sec+','+sec_plural+';</strong></span>';
        jQuery(this).html(event.strftime(format));
		 });
	});
 }
});
